import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Trash2, Download, Search, Eye } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import medicalRecordService from '../../api/services/medicalRecordService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminMedicalRecordsPage = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await medicalRecordService.getAllMedicalRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error, 'Failed to load medical records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      return;
    }
    try {
      await medicalRecordService.deleteMedicalRecord(recordId);
      handleSuccess('Medical record deleted successfully');
      fetchRecords();
    } catch (error) {
      handleError(error, 'Failed to delete medical record');
    }
  };

  // Helper function to get meaningful record title
  const getRecordTitle = (record) => {
    // Priority 1: Use chief complaint
    if (record.chiefComplaint || record.ChiefComplaint) {
      const complaint = record.chiefComplaint || record.ChiefComplaint;
      return complaint.length > 50 
        ? complaint.substring(0, 50) + '...'
        : complaint;
    }
    
    // Priority 2: Use diagnosis
    if (record.diagnosis || record.Diagnosis) {
      const diagnosis = record.diagnosis || record.Diagnosis;
      return 'Diagnosis: ' + (diagnosis.length > 40 
        ? diagnosis.substring(0, 40) + '...'
        : diagnosis);
    }
    
    // Priority 3: Use session notes preview
    if (record.sessionNotes || record.SessionNotes) {
      const notes = record.sessionNotes || record.SessionNotes;
      return 'Session Notes: ' + (notes.length > 40 
        ? notes.substring(0, 40) + '...'
        : notes);
    }
    
    // Fallback
    return 'Medical Session Notes';
  };

  const filteredRecords = records.filter(record => {
    const recordTitle = getRecordTitle(record);
    const matchesSearch = !searchTerm || 
      (record.patientName || record.PatientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.doctorName || record.DoctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      recordTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis || record.Diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.chiefComplaint || record.ChiefComplaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      recordTitle.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Patient', 'Doctor', 'Record Type', 'Diagnosis', 'Date'];
    const rows = filteredRecords.map(r => [
      r.patientName || r.PatientName || 'N/A',
      r.doctorName || r.DoctorName || 'N/A',
      getRecordTitle(r),
      r.diagnosis || r.Diagnosis || 'N/A',
      formatDate(r.createdAt || r.CreatedAt || r.recordDate || r.RecordDate)
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    handleSuccess('Medical records exported successfully');
  };

  const uniqueTypes = useMemo(() => {
    return [...new Set(records.map(r => {
      const title = getRecordTitle(r);
      return title.split(':')[0]; // Get the prefix (e.g., "Diagnosis", "Session Notes")
    }).filter(Boolean))];
  }, [records]);

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
      marginBottom: '0.5rem',
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
      marginBottom: '1.5rem',
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    },
    searchBox: {
      flex: 1,
      minWidth: '200px',
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
      width: '1rem',
      height: '1rem',
    },
    filterSelect: {
      padding: '0.75rem 1rem',
      border: '1px solid #D1D5DB',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      backgroundColor: '#FFFFFF',
      cursor: 'pointer',
    },
    exportButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#10b981',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    recordsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
    },
    recordCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
    },
    recordHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '1rem',
    },
    recordType: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1E40AF',
      backgroundColor: '#DBEAFE',
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
    },
    recordActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    actionButton: {
      padding: '0.5rem',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    recordInfo: {
      marginBottom: '0.75rem',
    },
    recordLabel: {
      fontSize: '0.75rem',
      color: '#6B7280',
      marginBottom: '0.25rem',
    },
    recordValue: {
      fontSize: '0.875rem',
      color: '#111827',
      fontWeight: '500',
    },
    warningNote: {
      backgroundColor: '#FEF3C7',
      border: '1px solid #FBBF24',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.5rem',
      color: '#92400E',
      fontSize: '0.875rem',
    },
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
              <h1 style={styles.title}>Medical Records Management</h1>
              <p style={styles.subtitle}>View and manage all medical records in the system</p>
            </div>

            <div style={styles.warningNote}>
              <strong>⚠️ Safety Notice:</strong> Admins can only view or delete medical records. Editing is restricted to maintain data integrity and compliance.
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by patient, doctor, type, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button onClick={handleExport} style={styles.exportButton}>
                <Download style={{ width: '1rem', height: '1rem' }} />
                Export CSV
              </button>
            </div>

            {filteredRecords.length === 0 ? (
              <EmptyState
                message={records.length === 0 ? "No medical records found." : "No records match your search criteria."}
                icon="📋"
              />
            ) : (
              <div style={styles.recordsGrid}>
                {filteredRecords.map((record) => (
                  <div key={record.medicalRecordId || record.MedicalRecordId} style={styles.recordCard}>
                    <div style={styles.recordHeader}>
                      <span style={styles.recordType}>
                        {getRecordTitle(record)}
                      </span>
                      <div style={styles.recordActions}>
                        <button
                          onClick={() => handleDelete(record.medicalRecordId || record.MedicalRecordId)}
                          style={{ ...styles.actionButton, ...styles.deleteButton }}
                          title="Delete record"
                        >
                          <Trash2 style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </div>
                    <div style={styles.recordInfo}>
                      <div style={styles.recordLabel}>Patient</div>
                      <div style={styles.recordValue}>{record.patientName || record.PatientName || 'N/A'}</div>
                    </div>
                    <div style={styles.recordInfo}>
                      <div style={styles.recordLabel}>Doctor</div>
                      <div style={styles.recordValue}>{record.doctorName || record.DoctorName || 'N/A'}</div>
                    </div>
                    {(record.diagnosis || record.Diagnosis) && (
                      <div style={styles.recordInfo}>
                        <div style={styles.recordLabel}>Diagnosis</div>
                        <div style={styles.recordValue}>{record.diagnosis || record.Diagnosis}</div>
                      </div>
                    )}
                    {(record.chiefComplaint || record.ChiefComplaint) && (
                      <div style={styles.recordInfo}>
                        <div style={styles.recordLabel}>Chief Complaint</div>
                        <div style={styles.recordValue}>
                          {(record.chiefComplaint || record.ChiefComplaint).length > 100
                            ? (record.chiefComplaint || record.ChiefComplaint).substring(0, 100) + '...'
                            : (record.chiefComplaint || record.ChiefComplaint)}
                        </div>
                      </div>
                    )}
                    <div style={styles.recordInfo}>
                      <div style={styles.recordLabel}>Date</div>
                      <div style={styles.recordValue}>
                        {formatDate(record.createdAt || record.CreatedAt || record.recordDate || record.RecordDate)}
                      </div>
                    </div>
                    {(record.sessionNotes || record.SessionNotes) && (
                      <div style={styles.recordInfo}>
                        <div style={styles.recordLabel}>Session Notes</div>
                        <div style={{ ...styles.recordValue, fontSize: '0.75rem', color: '#6B7280' }}>
                          {(record.sessionNotes || record.SessionNotes || '').length > 100
                            ? (record.sessionNotes || record.SessionNotes).substring(0, 100) + '...'
                            : (record.sessionNotes || record.SessionNotes)}
                        </div>
                      </div>
                    )}
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

export default AdminMedicalRecordsPage;

