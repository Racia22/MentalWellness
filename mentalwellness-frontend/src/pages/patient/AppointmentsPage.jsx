import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatTime } from '../../utils/formatters';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { Link } from 'react-router-dom';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments = [], loading, cancelAppointment } = useAppointments({ patientUserId: user?.userId });
  const { sidebarOpen, toggleSidebar } = useApp();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments || !Array.isArray(appointments)) return [];
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(apt.appointmentDate).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filterStatus]);

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
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    pageHeaderH1: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      margin: 0,
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
      fontSize: '1rem',
      marginTop: '0.5rem',
    },
    bookButton: {
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
      textDecoration: 'none',
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
    appointmentsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    appointmentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    appointmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    appointmentHeaderH3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: '0 0 0.5rem 0',
      color: '#0A1D56',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    appointmentDate: {
      color: '#6B7280',
      margin: 0,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    appointmentReason: {
      color: '#6B7280',
      margin: '0.5rem 0',
      fontSize: '0.875rem',
    },
    appointmentNotes: {
      color: '#6B7280',
      margin: '0.5rem 0',
      fontSize: '0.875rem',
    },
    appointmentStrong: {
      color: '#0A1D56',
      fontWeight: '600',
    },
    appointmentActions: {
      marginTop: '1rem',
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    badgeScheduled: {
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
    },
    badgeOngoing: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    badgeCompleted: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    badgeCancelled: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    cancelButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s',
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
      maxWidth: '500px',
      width: '100%',
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
    modalBody: {
      marginBottom: '1.5rem',
    },
    textarea: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    modalActions: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
    },
    modalCancelButton: {
      padding: '0.75rem 1.5rem',
      border: '2px solid #d1d5db',
      color: '#374151',
      borderRadius: '0.5rem',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s',
    },
    modalConfirmButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    statusInfo: {
      backgroundColor: '#FEF3C7',
      border: '1px solid #FCD34D',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      marginTop: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#92400E',
    },
  };

  const handleCancel = async () => {
    if (selectedAppointment && cancelReason.trim()) {
      try {
        await cancelAppointment(selectedAppointment.appointmentId, cancelReason);
        handleSuccess('Appointment cancelled successfully');
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setCancelReason('');
      } catch (error) {
        handleError(error, 'Failed to cancel appointment');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Scheduled: { ...styles.badge, ...styles.badgeScheduled },
      Ongoing: { ...styles.badge, ...styles.badgeOngoing },
      Completed: { ...styles.badge, ...styles.badgeCompleted },
      Cancelled: { ...styles.badge, ...styles.badgeCancelled },
    };
    return badgeStyles[status] || styles.badge;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
      case 'Ongoing':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Cancelled':
        return <XCircle style={{ width: '1rem', height: '1rem' }} />;
      default:
        return <AlertCircle style={{ width: '1rem', height: '1rem' }} />;
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

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageHeaderH1}>My Appointments</h1>
                <p style={styles.subtitle}>View and manage your appointments</p>
              </div>
              <Link to="/patient/appointments/book" style={styles.bookButton}>
                Book New Appointment
              </Link>
            </div>

            {/* Search and Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by doctor name, reason, or date..."
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled (Waiting Approval)</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
              <EmptyState
                message={appointments?.length === 0 ? "You don't have any appointments yet. Book your first appointment to get started." : "No appointments match your search criteria."}
                icon="📅"
              />
            ) : (
              <div style={styles.appointmentsList}>
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.appointmentId}
                    style={styles.appointmentCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.appointmentHeader}>
                      <div>
                        <h3 style={styles.appointmentHeaderH3}>
                          <User style={{ width: '1.25rem', height: '1.25rem' }} />
                          {apt.doctorName || 'Doctor'}
                        </h3>
                        <p style={styles.appointmentDate}>
                          <Calendar style={{ width: '1rem', height: '1rem' }} />
                          {formatDate(apt.appointmentDate)} at{' '}
                          <Clock style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginLeft: '0.5rem' }} />
                          {formatTime(apt.appointmentTime)}
                        </p>
                      </div>
                      <span style={getStatusBadge(apt.status)}>
                        {getStatusIcon(apt.status)}
                        {apt.status}
                      </span>
                    </div>
                    {apt.status === 'Scheduled' && (
                      <div style={styles.statusInfo}>
                        <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                        Waiting for doctor approval
                      </div>
                    )}
                    {apt.reason && (
                      <p style={styles.appointmentReason}>
                        <strong style={styles.appointmentStrong}>Reason:</strong> {apt.reason}
                      </p>
                    )}
                    {apt.notes && (
                      <p style={styles.appointmentNotes}>
                        <strong style={styles.appointmentStrong}>Notes:</strong> {apt.notes}
                      </p>
                    )}
                    <div style={styles.appointmentActions}>
                      {(apt.status === 'Scheduled' || apt.status === 'Ongoing') && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowCancelModal(true);
                          }}
                          style={styles.cancelButton}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={styles.modal} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Cancel Appointment</h2>
              <button onClick={() => setShowCancelModal(false)} style={styles.closeButton}>
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#0A1D56' }}>
                Reason for Cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                style={styles.textarea}
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
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                style={styles.modalCancelButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim()}
                style={{
                  ...styles.modalConfirmButton,
                  opacity: cancelReason.trim() ? 1 : 0.5,
                  cursor: cancelReason.trim() ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (cancelReason.trim()) {
                    e.currentTarget.style.backgroundColor = '#B91C1C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (cancelReason.trim()) {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;

