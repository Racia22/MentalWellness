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
import { handleError, handleSuccess } from '../../utils/errorHandler';

const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments = [], loading, updateAppointment } = useAppointments({ doctorUserId: user?.userId });
  const { sidebarOpen, toggleSidebar } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(apt.appointmentDate).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, filterStatus]);

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
      marginBottom: '2rem',
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
      flexWrap: 'wrap',
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
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    confirmButton: {
      backgroundColor: '#047857',
      color: '#FFFFFF',
    },
    cancelButton: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
    completeButton: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
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
      case 'Confirmed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Cancelled':
        return <XCircle style={{ width: '1rem', height: '1rem' }} />;
      default:
        return <AlertCircle style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      handleSuccess(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      handleError(error, 'Failed to update appointment');
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
            <div style={styles.header}>
              <h1 style={styles.title}>My Appointments</h1>
              <p style={styles.subtitle}>Manage patient appointments and approvals</p>
            </div>

            {/* Search and Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by patient name, reason, or date..."
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
                  <option value="Scheduled">Scheduled (Pending Approval)</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
              <EmptyState
                message={appointments?.length === 0 ? "You don't have any appointments scheduled." : "No appointments match your search criteria."}
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
                          {apt.patientName || 'Patient'}
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
                        Appointment request pending your approval
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
                      {apt.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(apt.appointmentId || apt.AppointmentId, 'Ongoing')}
                            style={{ ...styles.button, ...styles.confirmButton }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#065F46'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                          >
                            <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt.appointmentId || apt.AppointmentId, 'Cancelled')}
                            style={{ ...styles.button, ...styles.cancelButton }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                          >
                            <XCircle style={{ width: '1rem', height: '1rem' }} />
                            Reject
                          </button>
                        </>
                      )}
                      {apt.status === 'Ongoing' && (
                        <button
                          onClick={() => handleStatusUpdate(apt.appointmentId || apt.AppointmentId, 'Completed')}
                          style={{ ...styles.button, ...styles.completeButton }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                          <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                          Mark as Completed
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
    </div>
  );
};

export default DoctorAppointmentsPage;
