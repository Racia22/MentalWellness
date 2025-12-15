import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Calendar, Edit2, Trash2, Moon, X } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import moodLogService from '../../api/services/moodLogService';
import toast from 'react-hot-toast';

const MoodTrackingPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patientId, setPatientId] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    moodLevel: 'All',
    stressLevel: 'All',
  });
  const { logs = [], loading, createLog, updateLog, deleteLog, fetchLogs } = useMoodLogs({});
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: '',
    stressLevel: '',
    energyLevel: '',
    sleepHours: '',
    notes: '',
  });

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
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientId();
  }, [user]);

  // Map mood score to mood string
  const getMoodFromScore = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Neutral';
    if (score >= 3) return 'Poor';
    return 'VeryPoor';
  };

  // Map mood string to numeric score (1-10)
  const getMoodScore = (mood) => {
    const moodScores = {
      'VeryPoor': 1,
      'Poor': 3,
      'Neutral': 5,
      'Good': 7,
      'Excellent': 10,
    };
    return moodScores[mood] || 5;
  };

  // Get mood emoji based on score
  const getMoodEmoji = (score) => {
    if (score >= 7) return '😊';
    if (score >= 4) return '😐';
    return '😢';
  };

  // Get color for mood border
  const getMoodBorderColor = (score) => {
    if (score >= 7) return '#10B981'; // Green
    if (score >= 4) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        averageMood: 0,
        totalLogs: 0,
        averageStress: 'None',
        averageEnergy: 'Moderate',
        averageSleep: 0,
      };
    }

    const validLogs = logs.filter(log => log.moodScore || log.MoodScore);
    const totalMood = validLogs.reduce((sum, log) => sum + (log.moodScore || log.MoodScore || 0), 0);
    const totalSleep = validLogs.reduce((sum, log) => sum + (log.sleepHours || log.SleepHours || 0), 0);
    
    const stressLevels = validLogs.map(log => log.stressLevel || log.StressLevel || 'None');
    const energyLevels = validLogs.map(log => log.energyLevel || log.EnergyLevel || 'Moderate');
    
    return {
      averageMood: validLogs.length > 0 ? (totalMood / validLogs.length).toFixed(1) : 0,
      totalLogs: logs.length,
      averageStress: stressLevels[Math.floor(stressLevels.length / 2)] || 'None',
      averageEnergy: energyLevels[Math.floor(energyLevels.length / 2)] || 'Moderate',
      averageSleep: validLogs.length > 0 ? (totalSleep / validLogs.length).toFixed(1) : 0,
    };
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      const logDate = log.logDate || log.LogDate;
      const moodScore = log.moodScore || log.MoodScore || 0;
      const mood = getMoodFromScore(moodScore);
      const stressLevel = log.stressLevel || log.StressLevel || '';
      const notes = log.notes || log.Notes || '';
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        formatDate(logDate).toLowerCase().includes(searchTerm.toLowerCase()) ||
        notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
      const date = logDate ? new Date(logDate) : null;
      const matchesDateRange = 
        (!filters.startDate || !date || date >= new Date(filters.startDate)) &&
        (!filters.endDate || !date || date <= new Date(filters.endDate + 'T23:59:59'));
      
      // Mood level filter
      const matchesMood = filters.moodLevel === 'All' || mood === filters.moodLevel;
      
      // Stress level filter
      const matchesStress = filters.stressLevel === 'All' || stressLevel === filters.stressLevel;
      
      return matchesSearch && matchesDateRange && matchesMood && matchesStress;
    });
  }, [logs, searchTerm, filters]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenEdit = (log) => {
    const logDate = log.logDate || log.LogDate;
    const moodScore = log.moodScore || log.MoodScore || 0;
    const mood = getMoodFromScore(moodScore);
    
    setEditingLog(log);
    setFormData({
      date: logDate ? new Date(logDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      mood: mood,
      stressLevel: log.stressLevel || log.StressLevel || '',
      energyLevel: log.energyLevel || log.EnergyLevel || '',
      sleepHours: (log.sleepHours || log.SleepHours || 0).toString(),
      notes: log.notes || log.Notes || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLog(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mood: '',
      stressLevel: '',
      energyLevel: '',
      sleepHours: '',
      notes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.mood) {
      handleError(new Error('Mood is required'), 'Please select a mood');
      return;
    }
    
    if (!formData.stressLevel) {
      handleError(new Error('Stress level is required'), 'Please select a stress level');
      return;
    }
    
    if (!formData.energyLevel) {
      handleError(new Error('Energy level is required'), 'Please select an energy level');
      return;
    }
    
    try {
      if (!patientId) {
        handleError(new Error('Patient ID not found'), 'Please log in again');
        return;
      }

      // Map form data to backend DTO format (PascalCase)
      const logData = {
        PatientId: patientId,
        LogDate: formData.date ? new Date(formData.date).toISOString() : null,
        MoodScore: getMoodScore(formData.mood),
        StressLevel: formData.stressLevel,
        SleepHours: parseFloat(formData.sleepHours) || 0,
        EnergyLevel: formData.energyLevel,
        Notes: formData.notes?.trim() || null,
        Activities: null,
        Triggers: null,
      };

      if (editingLog) {
        const logId = editingLog.moodLogId || editingLog.MoodLogId;
        await updateLog(logId, logData);
      } else {
        await createLog(logData);
      }
      
      handleSuccess(editingLog ? 'Mood log updated successfully' : 'Mood log added successfully');
      handleCloseModal();
      await fetchLogs();
    } catch (error) {
      handleError(error, editingLog ? 'Failed to update mood log' : 'Failed to create mood log');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const logId = deleteConfirm.moodLogId || deleteConfirm.MoodLogId;
      await deleteLog(logId);
      setDeleteConfirm(null);
      await fetchLogs();
    } catch (error) {
      handleError(error, 'Failed to delete mood log');
    }
  };

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
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#6B7280',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
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
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    searchWrapper: {
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
      padding: '0.5rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s',
    },
    logsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
    },
    logCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      borderLeft: '4px solid',
      transition: 'all 0.3s',
      position: 'relative',
    },
    logHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    logDate: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
    },
    logActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    actionButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      color: '#6B7280',
      transition: 'all 0.2s',
    },
    moodScore: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.375rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    badgeLow: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    badgeMedium: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    badgeHigh: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    logDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    detailValue: {
      fontSize: '0.875rem',
      color: '#0A1D56',
      fontWeight: '600',
    },
    notes: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontStyle: 'italic',
      marginTop: '0.5rem',
      padding: '0.75rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6B7280',
      padding: '0.25rem',
      lineHeight: 1,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '1rem',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      border: '2px solid #d1d5db',
      color: '#374151',
      borderRadius: '0.5rem',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
      fontWeight: '500',
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
      fontWeight: '600',
    },
    confirmModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '1rem',
    },
    confirmContent: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '400px',
      width: '100%',
    },
    confirmTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '1rem',
    },
    confirmMessage: {
      fontSize: '1rem',
      color: '#6B7280',
      marginBottom: '1.5rem',
    },
    confirmActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
  };

  if (loading || loadingPatient) {
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

  const getBadgeStyle = (level) => {
    if (['None', 'Low', 'VeryLow'].includes(level)) return styles.badgeLow;
    if (['Moderate', 'High'].includes(level)) return styles.badgeMedium;
    return styles.badgeHigh;
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Mood Tracking</h1>
                <p style={styles.subtitle}>Track your mood and emotional well-being over time</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={styles.addButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                Add Mood Log
              </button>
            </div>

            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.averageMood}/10</div>
                <div style={styles.statLabel}>Average Mood</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.totalLogs}</div>
                <div style={styles.statLabel}>Total Logs</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.averageStress}</div>
                <div style={styles.statLabel}>Avg Stress Level</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.averageEnergy}</div>
                <div style={styles.statLabel}>Avg Energy Level</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{statistics.averageSleep}h</div>
                <div style={styles.statLabel}>Avg Sleep Hours</div>
              </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by date or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '2px solid #1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '2px solid #e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value || null })}
                  style={styles.select}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value || null })}
                  style={styles.select}
                />
                <select
                  value={filters.moodLevel}
                  onChange={(e) => setFilters({ ...filters, moodLevel: e.target.value })}
                  style={styles.select}
                >
                  <option value="All">All Moods</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Poor">Poor</option>
                  <option value="VeryPoor">Very Poor</option>
                </select>
                <select
                  value={filters.stressLevel}
                  onChange={(e) => setFilters({ ...filters, stressLevel: e.target.value })}
                  style={styles.select}
                >
                  <option value="All">All Stress Levels</option>
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="VeryHigh">Very High</option>
                </select>
              </div>
            </div>

            {/* Mood Logs Grid */}
            {filteredLogs.length === 0 ? (
              <EmptyState
                message={logs?.length === 0 ? "No mood logs yet. Start tracking your mood to see your progress over time." : "No logs match your search criteria."}
                icon="😊"
              />
            ) : (
              <div style={styles.logsGrid}>
                {filteredLogs.map((log) => {
                  const logId = log.moodLogId || log.MoodLogId;
                  const logDate = log.logDate || log.LogDate;
                  const moodScore = log.moodScore || log.MoodScore || 0;
                  const stressLevel = log.stressLevel || log.StressLevel || '';
                  const energyLevel = log.energyLevel || log.EnergyLevel || '';
                  const sleepHours = log.sleepHours || log.SleepHours || 0;
                  const notes = log.notes || log.Notes || '';
                  const borderColor = getMoodBorderColor(moodScore);

                  return (
                    <div
                      key={logId}
                      style={{ ...styles.logCard, borderLeftColor: borderColor }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={styles.logHeader}>
                        <div style={styles.logDate}>
                          <Calendar style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
                          {formatDate(logDate, 'long')}
                        </div>
                        <div style={styles.logActions}>
                          <button
                            onClick={() => handleOpenEdit(log)}
                            style={styles.actionButton}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#EFF6FF';
                              e.currentTarget.style.color = '#1E40AF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#6B7280';
                            }}
                            title="Edit"
                          >
                            <Edit2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(log)}
                            style={styles.actionButton}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                              e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#6B7280';
                            }}
                            title="Delete"
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </div>
                      <div style={styles.moodScore}>
                        <span>{getMoodEmoji(moodScore)}</span>
                        <span style={{ color: borderColor }}>{moodScore}/10</span>
                      </div>
                      <div style={styles.logDetails}>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Stress Level</span>
                          <span style={{ ...styles.badge, ...getBadgeStyle(stressLevel) }}>
                            {stressLevel}
                          </span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Energy Level</span>
                          <span style={{ ...styles.badge, ...getBadgeStyle(energyLevel) }}>
                            {energyLevel}
                          </span>
                        </div>
                        {sleepHours > 0 && (
                          <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Sleep Hours</span>
                            <span style={styles.detailValue}>
                              <Moon style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.25rem' }} />
                              {sleepHours}h
                            </span>
                          </div>
                        )}
                      </div>
                      {notes && (
                        <div style={styles.notes}>
                          {notes.length > 100 ? `${notes.substring(0, 100)}...` : notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Mood Log Modal */}
      {showModal && (
        <div style={styles.modal} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editingLog ? 'Edit Mood Log' : 'Add Mood Log'}</h2>
              <button onClick={handleCloseModal} style={styles.closeButton}>
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mood</label>
                <select
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select mood</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Poor">Poor</option>
                  <option value="VeryPoor">Very Poor</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stress Level</label>
                <select
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select stress level</option>
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="VeryHigh">Very High</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Energy Level</label>
                <select
                  name="energyLevel"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select energy level</option>
                  <option value="VeryHigh">Very High</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                  <option value="VeryLow">Very Low</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sleep Hours</label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  style={styles.input}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="0"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  style={styles.textarea}
                  placeholder="How are you feeling today?"
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                >
                  {editingLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={styles.confirmModal} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.confirmContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.confirmTitle}>Delete Mood Log</h3>
            <p style={styles.confirmMessage}>
              Are you sure you want to delete this mood log? This action cannot be undone.
            </p>
            <div style={styles.confirmActions}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  ...styles.submitButton,
                  backgroundColor: '#DC2626',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTrackingPage;
