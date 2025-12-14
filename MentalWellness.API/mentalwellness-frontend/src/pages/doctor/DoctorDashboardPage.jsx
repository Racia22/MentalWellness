import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Search, AlertCircle, Activity, User, TrendingDown } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAppointments } from '../../hooks/useAppointments';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatTime } from '../../utils/formatters';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { appointments = [], loading: appointmentsLoading, updateAppointment, fetchAppointments } = useAppointments({ doctorUserId: user?.userId });
  const { sidebarOpen, toggleSidebar } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('Upcoming');
  
  const loading = appointmentsLoading;

  // Inline styles
  const styles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: '#F5F5F0',
      display: 'flex',
      flexDirection: 'column',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: '#F5F5F0',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    headerText: {},
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    titleAccent: {
      color: '#1E40AF',
    },
    titlePrimary: {
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
    },
    button: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      width: '4rem',
      height: '4rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statContent: {},
    statNumber: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    filtersCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    filtersRow: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    searchWrapper: {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
      width: '1.25rem',
      height: '1.25rem',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    select: {
      minWidth: '150px',
      padding: '0.5rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s',
    },
    appointmentsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '1.5rem',
    },
    appointmentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    appointmentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      transition: 'all 0.3s',
    },
    appointmentInfo: {
      flex: 1,
    },
    appointmentName: {
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    appointmentDetails: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
  };

  const filteredAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter((apt) => {
      const appointmentDate = new Date(apt.appointmentDate);
      appointmentDate.setHours(0, 0, 0, 0);

      const matchesSearch =
        apt.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || apt.status === filterStatus;
      const matchesDateRange =
        filterDateRange === 'All' ||
        (filterDateRange === 'Today' && appointmentDate.toDateString() === today.toDateString()) ||
        (filterDateRange === 'Upcoming' && appointmentDate >= today && (apt.status === 'Scheduled' || apt.status === 'Confirmed'));

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [appointments, searchTerm, filterStatus, filterDateRange]);

  const todayAppointmentsCount = appointments?.filter(
    (a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  ).length || 0;

  const upcomingAppointmentsCount = appointments?.filter((a) =>
    (a.status === 'Scheduled' || a.status === 'Confirmed') && new Date(a.appointmentDate) >= new Date()
  ).length || 0;

  const completedAppointmentsCount = appointments?.filter((a) => a.status === 'Completed').length || 0;

  // Pending approvals (Scheduled appointments waiting for doctor approval)
  const pendingApprovals = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((a) => a.status === 'Scheduled')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);
  }, [appointments]);

  const pendingApprovalsCount = pendingApprovals.length;

  // Mood alerts - patients with significant mood drops (simplified - would need patient mood data)
  const moodAlerts = useMemo(() => {
    // This would typically come from a service that analyzes patient mood trends
    // For now, return empty array - can be enhanced with actual mood data
    return [];
  }, []);

  const handleApproveAppointment = async (appointmentId) => {
    try {
      await updateAppointment(appointmentId, { status: 'Confirmed' });
      handleSuccess('Appointment approved successfully');
      await fetchAppointments(); // Refresh the list
    } catch (error) {
      handleError(error, 'Failed to approve appointment');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      await updateAppointment(appointmentId, { status: 'Cancelled' });
      handleSuccess('Appointment rejected');
      await fetchAppointments(); // Refresh the list
    } catch (error) {
      handleError(error, 'Failed to reject appointment');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}>
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

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            {/* Dashboard Header */}
            <div style={styles.header}>
              <div style={styles.headerText}>
                <h1 style={styles.title}>
                  <span style={styles.titleAccent}>Welcome,</span>{' '}
                  <span style={styles.titlePrimary}>Dr. {user?.fullName || 'Doctor'}!</span>
                </h1>
                <p style={styles.subtitle}>Here's your dashboard overview</p>
              </div>
              <Link to="/doctor/appointments">
                <button 
                  style={styles.button}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                >
                  View All Appointments
                </button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>
                  <Calendar style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{todayAppointmentsCount}</div>
                  <div style={styles.statLabel}>Today's Appointments</div>
                </div>
              </div>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ ...styles.statIcon, backgroundColor: '#FED7AA' }}>
                  <Clock style={{ width: '2rem', height: '2rem', color: '#EA580C' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{upcomingAppointmentsCount}</div>
                  <div style={styles.statLabel}>Upcoming</div>
                </div>
              </div>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>
                  <CheckCircle style={{ width: '2rem', height: '2rem', color: '#047857' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{completedAppointmentsCount}</div>
                  <div style={styles.statLabel}>Completed</div>
                </div>
              </div>
              <div 
                style={styles.statCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>
                  <AlertCircle style={{ width: '2rem', height: '2rem', color: '#F59E0B' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{pendingApprovalsCount}</div>
                  <div style={styles.statLabel}>Pending Approvals</div>
                </div>
              </div>
            </div>

            {/* Pending Approvals Section */}
            {pendingApprovalsCount > 0 && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f3f4f6',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #F59E0B'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#0A1D56',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#F59E0B' }} />
                    Pending Appointment Approvals ({pendingApprovalsCount})
                  </h2>
                  <Link to="/doctor/appointments" style={{ fontSize: '0.875rem', color: '#1E40AF', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pendingApprovals.map((apt) => (
                    <div
                      key={apt.appointmentId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: '#FFFBEB',
                        borderRadius: '0.5rem',
                        border: '1px solid #FEF3C7'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#0A1D56', marginBottom: '0.25rem' }}>
                          {apt.patientName || apt.patient?.fullName || 'Patient'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                          {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
                        </div>
                        {apt.reason && (
                          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            Reason: {apt.reason}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveAppointment(apt.appointmentId)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#065F46'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                        >
                          <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectAppointment(apt.appointmentId)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#DC2626',
                            color: '#FFFFFF',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Alerts Section */}
            {moodAlerts.length > 0 && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #f3f4f6',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #EF4444'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#0A1D56',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <TrendingDown style={{ width: '1.25rem', height: '1.25rem', color: '#EF4444' }} />
                  Mood Alerts
                </h2>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                  Patients with significant mood drops detected. Review their mood tracking data.
                </p>
              </div>
            )}

            {/* Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by patient or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
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
                  style={styles.select}
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
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            {/* Appointments List */}
            <div style={styles.appointmentsCard}>
              <h2 style={styles.cardTitle}>My Appointments</h2>
              {filteredAppointments.length > 0 ? (
                <div style={styles.appointmentsList}>
                  {filteredAppointments.map((apt) => {
                    const statusColor = statusColors[apt.status] || statusColors.Completed;
                    return (
                      <div
                        key={apt.appointmentId}
                        style={styles.appointmentItem}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={styles.appointmentInfo}>
                          <h4 style={styles.appointmentName}>
                            {apt.patient?.fullName || 'N/A'}
                          </h4>
                          <p style={styles.appointmentDetails}>
                            {apt.appointmentType} on {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
                          </p>
                        </div>
                        <span 
                          style={{
                            ...styles.badge,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {apt.status}
                        </span>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
