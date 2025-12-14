import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Plus, Search, Activity, TrendingUp, Bell, Video, MessageSquare, FileText, BarChart3, Award, Heart, User, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAppointments } from '../../hooks/useAppointments';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatTime } from '../../utils/formatters';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import patientService from '../../api/services/patientService';
import toast from 'react-hot-toast';

const PatientDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patientId, setPatientId] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Fetch patientId first
  useEffect(() => {
    const fetchPatientId = async () => {
      if (!user) {
        setLoadingPatient(false);
        return;
      }

      try {
        const currentUserId = user?.userId || user?.UserId;
        if (!currentUserId) {
          setLoadingPatient(false);
          return;
        }

        const patientData = await patientService.getPatientByUserId(currentUserId);
        const id = patientData.patientId || patientData.PatientId;
        if (id) {
          setPatientId(id);
        }
      } catch (error) {
        console.error('Failed to get patient data:', error);
        // Don't show error toast - might be expected if user is not a patient
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientId();
  }, [user]);

  // Use patientId for appointments and mood logs
  // For patients viewing their own data, don't pass patientId - backend filters by authenticated user
  const { appointments = [], loading: appointmentsLoading } = useAppointments({ 
    patientUserId: user?.userId,
    patientId: patientId 
  });
  // For mood logs, patients should use general endpoint (no patientId) - backend filters by authenticated user
  const { logs: moodLogs = [], loading: moodLogsLoading } = useMoodLogs({});
  
  const loading = loadingPatient || appointmentsLoading || moodLogsLoading;

  const filteredAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];
    return appointments.filter((apt) => {
      const doctorName = apt.doctor?.fullName || apt.doctorName || '';
      const appointmentType = apt.appointmentType || apt.type || '';
      const matchesSearch =
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointmentType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filterStatus]);

  const totalAppointments = appointments?.length || 0;
  const completedAppointments = appointments?.filter((a) => a.status === 'Completed').length || 0;
  const upcomingAppointments = appointments?.filter((a) =>
    (a.status === 'Scheduled' || a.status === 'Confirmed') && new Date(a.appointmentDate) >= new Date()
  ).length || 0;
  const cancelledAppointments = appointments?.filter((a) => a.status === 'Cancelled').length || 0;

  // Get recent activities (appointments, mood logs, etc.)
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add appointments as activities
    if (appointments && appointments.length > 0) {
      appointments.forEach(apt => {
        activities.push({
          id: `apt-${apt.appointmentId}`,
          type: 'appointment',
          action: apt.status === 'Completed' ? 'completed' : apt.status === 'Cancelled' ? 'cancelled' : 'scheduled',
          description: `${apt.status === 'Completed' ? 'Completed' : apt.status === 'Cancelled' ? 'Cancelled' : 'Scheduled'} ${apt.appointmentType || 'appointment'}`,
          details: `with ${apt.doctor?.fullName || apt.doctorName || 'Doctor'}`,
          timestamp: apt.appointmentDate ? new Date(apt.appointmentDate) : new Date(),
          icon: apt.status === 'Completed' ? '✅' : apt.status === 'Cancelled' ? '❌' : '📅',
          color: apt.status === 'Completed' ? '#10b981' : apt.status === 'Cancelled' ? '#ef4444' : '#3b82f6',
        });
      });
    }
    
    // Add mood logs as activities
    if (moodLogs && moodLogs.length > 0) {
      moodLogs.forEach(log => {
        const score = log.moodScore || log.MoodScore || 5;
        const emoji = score >= 7 ? '😊' : score >= 4 ? '😐' : '😢';
        activities.push({
          id: `mood-${log.moodLogId || log.MoodLogId}`,
          type: 'moodlog',
          action: 'added',
          description: `Mood log added`,
          details: `Score: ${score}/10 ${emoji}`,
          timestamp: new Date(log.logDate || log.LogDate || log.date || new Date()),
          icon: emoji,
          color: '#8b5cf6',
        });
      });
    }
    
    // Sort by timestamp (most recent first) and take last 10
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [appointments, moodLogs]);

  // Get upcoming appointment
  const nextAppointment = useMemo(() => {
    if (!appointments) return null;
    return appointments
      .filter((a) => (a.status === 'Scheduled' || a.status === 'Confirmed') && new Date(a.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
  }, [appointments]);

  // Calculate completion rate
  const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  // Helper to get mood string from score
  const getMoodFromScore = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Neutral';
    if (score >= 3) return 'Poor';
    return 'VeryPoor';
  };

  // Helper to get time ago string
  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Mood tracking data for graph
  const moodData = useMemo(() => {
    if (!moodLogs || moodLogs.length === 0) return [];
    // Get last 7 days of mood logs
    const last7Days = moodLogs
      .sort((a, b) => {
        const dateA = new Date(a.logDate || a.LogDate || a.date || 0);
        const dateB = new Date(b.logDate || b.LogDate || b.date || 0);
        return dateB - dateA;
      })
      .slice(0, 7)
      .reverse();
    
    // Map mood score (1-10) to graph value (1-5)
    return last7Days.map(log => {
      const score = log.moodScore || log.MoodScore || 5;
      const date = log.logDate || log.LogDate || log.date;
      return {
        date: formatDate(date),
        mood: getMoodFromScore(score),
        value: Math.ceil(score / 2), // Convert 1-10 to 1-5 scale
        score: score,
      };
    });
  }, [moodLogs]);

  // Calculate average mood
  const averageMood = useMemo(() => {
    if (!moodLogs || moodLogs.length === 0) return null;
    const sum = moodLogs.reduce((acc, log) => {
      const score = log.moodScore || log.MoodScore || 5;
      return acc + score;
    }, 0);
    return (sum / moodLogs.length).toFixed(1);
  }, [moodLogs]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={{ flex: 1, padding: '2rem' }}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  const statusColors = {
    Scheduled: { bg: '#DBEAFE', text: '#1E40AF' },
    Confirmed: { bg: '#D1FAE5', text: '#047857' },
    Completed: { bg: '#F3F4F6', text: '#374151' },
    Cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  };

  // Inline styles to prevent layout shifts
  const pageStyles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: '#F5F5F0',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
      minHeight: 0, // Prevent flex shrink issues
    },
    main: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      minHeight: 0,
      width: '100%',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s ease',
      minHeight: '120px', // Fixed height to prevent shifts
      display: 'flex',
      alignItems: 'center',
    },
  };

  return (
    <div style={pageStyles.page}>
      <Header />
      <div style={pageStyles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={pageStyles.main}>
          <div style={pageStyles.container}>
            
            {/* Welcome Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h1 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: '#0A1D56'
                }}>
                  <span style={{ color: '#1E40AF' }}>Welcome back,</span> {user?.fullName || 'Patient'}! 👋
                </h1>
                <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
                  Here's your mental wellness journey overview
                </p>
              </div>
              <Link to="/patient/appointments/book" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    backgroundColor: '#1E40AF',
                    color: '#FFFFFF',
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.3)';
                    e.currentTarget.style.backgroundColor = '#2563EB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                    e.currentTarget.style.backgroundColor = '#1E40AF';
                  }}
                >
                  <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                  Book Appointment
                </button>
              </Link>
            </div>

            {/* Next Appointment Alert */}
            {nextAppointment && (
              <div style={{
                backgroundColor: '#DBEAFE',
                border: '2px solid #1E40AF',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <Bell style={{ width: '2rem', height: '2rem', color: '#1E40AF', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: '600', color: '#0A1D56', marginBottom: '0.25rem' }}>
                    Upcoming Appointment
                  </h3>
                  <p style={{ color: '#1E40AF', fontSize: '0.95rem' }}>
                    {nextAppointment.appointmentType || nextAppointment.type || 'Appointment'} with {nextAppointment.doctor?.fullName || nextAppointment.doctorName || 'Doctor'} on {formatDate(nextAppointment.appointmentDate)} at {formatTime(nextAppointment.appointmentTime)}
                  </p>
                </div>
                <Link to={`/patient/appointments/${nextAppointment.appointmentId}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    backgroundColor: '#1E40AF',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    View Details
                  </button>
                </Link>
              </div>
            )}

            {/* Statistics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s ease',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1E40AF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)'
                  }}>
                    <Calendar style={{ width: '2rem', height: '2rem', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0A1D56' }}>
                      {totalAppointments}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                      Total Appointments
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s ease',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}>
                    <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0A1D56' }}>
                      {completedAppointments}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                      Completed Sessions
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s ease',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Clock style={{ width: '2rem', height: '2rem', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0A1D56' }}>
                      {upcomingAppointments}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                      Upcoming Sessions
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s ease',
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}>
                    <TrendingUp style={{ width: '2rem', height: '2rem', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0A1D56' }}>
                      {completionRate}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>
                      Completion Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                
                {/* Quick Actions */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#0A1D56',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                    Quick Actions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/patient/appointments/book" style={{ textDecoration: 'none' }}>
                      <button
                        style={{
                          width: '100%',
                          backgroundColor: '#1E40AF',
                          color: 'white',
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.3)';
                          e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.backgroundColor = '#1E40AF';
                        }}
                      >
                        <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                        Schedule Appointment
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        const todayAppointment = appointments.find(a => 
                          (a.status === 'Scheduled' || a.status === 'Confirmed') && 
                          new Date(a.appointmentDate).toDateString() === new Date().toDateString()
                        );
                        if (todayAppointment) {
                          navigate(`/patient/video-session/${todayAppointment.appointmentId}`);
                        } else {
                          toast.error('No scheduled session for today');
                        }
                      }}
                      style={{
                        transition: 'all 0.3s ease',
                        width: '100%',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Video style={{ width: '1.25rem', height: '1.25rem' }} />
                      Start Video Session
                    </button>
                    <button
                      onClick={() => navigate('/patient/messages')}
                      style={{
                        transition: 'all 0.3s ease',
                        width: '100%',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <MessageSquare style={{ width: '1.25rem', height: '1.25rem' }} />
                      Message Therapist
                    </button>
                    <button
                      onClick={() => {
                        toast.info('Resources page coming soon!');
                        // navigate('/patient/resources');
                      }}
                      style={{
                        transition: 'all 0.3s ease',
                        width: '100%',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d97706';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f59e0b';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FileText style={{ width: '1.25rem', height: '1.25rem' }} />
                      View Resources
                    </button>
                  </div>
                </div>

                {/* Progress Overview */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#0A1D56',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                    Your Progress
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: '600', color: '#0A1D56' }}>Sessions Completed</span>
                        <span style={{ fontWeight: '600', color: '#1E40AF' }}>
                          {completedAppointments}/{totalAppointments}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '0.75rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: `${completionRate}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #1E40AF 100%)',
                            borderRadius: '9999px',
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontWeight: '600', color: '#0A1D56' }}>Wellness Score</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>85/100</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '0.75rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: '85%',
                            height: '100%',
                            background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)',
                            borderRadius: '9999px',
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '2px solid #10b981',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <Award style={{ width: '2rem', height: '2rem', color: '#10b981', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#047857', marginBottom: '0.25rem' }}>
                          Great Progress!
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#065f46' }}>
                          Keep up the consistency
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mood Summary Graph */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #f3f4f6'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#0A1D56',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                    Mood Summary
                    {averageMood && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '1.25rem',
                        color: '#1E40AF',
                        fontWeight: '600'
                      }}>
                        Avg: {averageMood}/10
                      </span>
                    )}
                  </h2>
                  {moodData.length > 0 ? (
                    <div>
                      {/* Simple Bar Chart */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        height: '150px',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '0.5rem'
                      }}>
                        {moodData.map((item, idx) => {
                          const height = (item.score / 10) * 100; // Use score (1-10) for height
                          const colors = {
                            10: '#10b981',
                            9: '#10b981',
                            8: '#84cc16',
                            7: '#84cc16',
                            6: '#fbbf24',
                            5: '#fbbf24',
                            4: '#f97316',
                            3: '#f97316',
                            2: '#ef4444',
                            1: '#ef4444',
                          };
                          return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '100%',
                                height: `${height}%`,
                                backgroundColor: colors[item.score] || '#fbbf24',
                                borderRadius: '0.25rem 0.25rem 0 0',
                                minHeight: '20px',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                              }}
                              title={`${item.date}: ${item.mood} (${item.score}/10)`}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.transform = 'scaleY(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scaleY(1)';
                              }}
                              />
                              <span style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
                                {formatDate(item.date)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <Link to="/patient/mood-tracking" style={{ textDecoration: 'none' }}>
                        <button style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#1E40AF',
                          color: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563EB';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1E40AF';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                          Track Today's Mood
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <Activity style={{ width: '3rem', height: '3rem', color: '#9CA3AF', margin: '0 auto 1rem' }} />
                      <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Start tracking your mood to see your progress</p>
                      <Link to="/patient/mood-tracking" style={{ textDecoration: 'none' }}>
                        <button style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#1E40AF',
                          color: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1E40AF';
                        }}
                        >
                          Add First Mood Log
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f3f4f6',
              marginBottom: '2rem'
            }}>
              {/* Filters */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#0A1D56',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                  My Appointments
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', minWidth: '250px' }}>
                    <Search style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B7280',
                      width: '1.25rem',
                      height: '1.25rem'
                    }} />
                    <input
                      type="text"
                      placeholder="Search by doctor or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '1rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      minWidth: '150px',
                      padding: '0.5rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Appointments List */}
              {filteredAppointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredAppointments.map((apt) => {
                    const statusColor = statusColors[apt.status] || statusColors.Completed;
                    return (
                      <div
                        key={apt.appointmentId}
                        style={{
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1.25rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#1E40AF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1E40AF 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <User style={{ width: '2rem', height: '2rem', color: 'white' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontWeight: '600',
                              color: '#0A1D56',
                              marginBottom: '0.25rem',
                              fontSize: '1.1rem'
                            }}>
                              {apt.doctor?.fullName || apt.doctorName || 'N/A'}
                            </h4>
                            <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                              {apt.doctor?.specialty || apt.appointmentType || apt.type || 'Appointment'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar style={{ width: '1rem', height: '1rem' }} />
                              {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}>
                            {apt.status}
                          </span>
                          <Link to={`/patient/appointments/${apt.appointmentId}`} style={{ textDecoration: 'none' }}>
                            <button style={{
                              backgroundColor: '#1E40AF',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}>
                              View
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  message="No appointments found matching your criteria."
                  icon="😔"
                />
              )}
            </div>

            {/* Recent Activity */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f3f4f6'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#0A1D56',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                Recent Activity
              </h2>
              
              {recentActivities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentActivities.map((activity) => {
                    const timeAgo = getTimeAgo(activity.timestamp);
                    return (
                      <div
                        key={activity.id}
                        style={{
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: activity.color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.25rem'
                        }}>
                          {activity.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', color: '#0A1D56', marginBottom: '0.25rem' }}>
                            {activity.description}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            {activity.details}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6B7280',
                          flexShrink: 0
                        }}>
                          {timeAgo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState message="No recent activity" icon="📋" />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
