import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Search, User, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import appointmentService from '../../api/services/appointmentService';
import { handleError } from '../../utils/errorHandler';
import { formatDate, formatTime } from '../../utils/formatters';

const AdminAppointmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAllAppointments();
      const data = Array.isArray(response) ? response : (response?.data || []);
      setAppointments(data);
    } catch (error) {
      handleError(error, 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <Calendar style={{ width: '1rem', height: '1rem', color: '#3B82F6' }} />;
      case 'ongoing':
        return <Clock style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} />;
      case 'completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10B981' }} />;
      case 'cancelled':
        return <XCircle style={{ width: '1rem', height: '1rem', color: '#EF4444' }} />;
      case 'noshow':
        return <AlertCircle style={{ width: '1rem', height: '1rem', color: '#F59E0B' }} />;
      default:
        return <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return '#3B82F6';
      case 'ongoing':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'noshow':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = (appointment.patientName || appointment.PatientName || '').toLowerCase();
    const doctorName = (appointment.doctorName || appointment.DoctorName || '').toLowerCase();
    const status = (appointment.status || appointment.Status || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || 
      patientName.includes(searchLower) ||
      doctorName.includes(searchLower);
    
    const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const styles = {
    page: { minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#F5F5F0', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1, width: '100%' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#F5F5F0' },
    container: { maxWidth: '1280px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0A1D56' },
    subtitle: { color: '#6B7280', marginBottom: '1.5rem' },
    controls: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    searchBox: { position: 'relative', flex: 1, minWidth: '300px' },
    searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: '1rem', height: '1rem' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem', backgroundColor: '#FFFFFF', cursor: 'pointer' },
    appointmentsTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}><LoadingScreen /></main>
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
              <h1 style={styles.title}>Appointments Management</h1>
              <p style={styles.subtitle}>View and manage all appointments in the system</p>
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by patient or doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="noshow">No Show</option>
              </select>
            </div>

            {filteredAppointments.length === 0 ? (
              <EmptyState
                message={appointments.length === 0 ? "No appointments found." : "No appointments match your search criteria."}
                icon="📅"
              />
            ) : (
              <div style={styles.appointmentsTable}>
                <div style={styles.tableHeader}>
                  <div>Patient</div>
                  <div>Doctor</div>
                  <div>Date</div>
                  <div>Time</div>
                  <div>Status</div>
                  <div>Amount</div>
                  <div>Type</div>
                </div>
                {filteredAppointments.map((appointment) => {
                  const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate;
                  const appointmentTime = appointment.appointmentTime || appointment.AppointmentTime;
                  const status = appointment.status || appointment.Status || 'Unknown';
                  const dateObj = appointmentDate ? new Date(appointmentDate) : null;
                  const timeDisplay = formatTime(appointmentTime);

                  return (
                    <div 
                      key={appointment.appointmentId || appointment.AppointmentId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {appointment.patientName || appointment.PatientName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {appointment.doctorName || appointment.DoctorName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {dateObj ? formatDate(dateObj) : 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <Clock style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {timeDisplay}
                      </div>
                      <div style={styles.tableCell}>
                        <span style={{ ...styles.statusBadge, backgroundColor: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </div>
                      <div style={styles.tableCell}>
                        <DollarSign style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {appointment.amount || appointment.Amount || 0}
                      </div>
                      <div style={styles.tableCell}>
                        {appointment.appointmentType || appointment.AppointmentType || 'N/A'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;
