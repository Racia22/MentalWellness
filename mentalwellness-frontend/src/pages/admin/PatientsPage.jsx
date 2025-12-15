import React, { useState, useEffect, useCallback } from 'react';
import { User, Search, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import patientService from '../../api/services/patientService';
import { handleError } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminPatientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients();
      const data = Array.isArray(response) ? response : (response?.data || []);
      setPatients(data);
    } catch (error) {
      handleError(error, 'Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(patient => {
    const fullName = (patient.fullName || patient.FullName || '').toLowerCase();
    const email = (patient.email || patient.Email || '').toLowerCase();
    const phone = (patient.phone || patient.Phone || '').toLowerCase();
    const patientIdNumber = (patient.patientIDNumber || patient.PatientIDNumber || '').toLowerCase();
    const category = (patient.category || patient.Category || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = !searchTerm || 
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower) ||
      patientIdNumber.includes(searchLower);
    
    const matchesCategory = !categoryFilter || category === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(patients.map(p => p.category || p.Category).filter(Boolean))];

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
    patientsTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1fr 1.5fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    categoryBadge: { padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#DBEAFE', color: '#1E40AF' },
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
              <h1 style={styles.title}>Patients Management</h1>
              <p style={styles.subtitle}>View and manage all patients in the system</p>
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            {filteredPatients.length === 0 ? (
              <EmptyState
                message={patients.length === 0 ? "No patients found." : "No patients match your search criteria."}
                icon="👤"
              />
            ) : (
              <div style={styles.patientsTable}>
                <div style={styles.tableHeader}>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Phone</div>
                  <div>Patient ID</div>
                  <div>Age</div>
                  <div>Category</div>
                  <div>Gender</div>
                </div>
                {filteredPatients.map((patient) => {
                  const dateOfBirth = patient.dateOfBirth || patient.DateOfBirth;
                  const dobObj = dateOfBirth ? new Date(dateOfBirth) : null;
                  
                  return (
                    <div 
                      key={patient.patientId || patient.PatientId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {patient.fullName || patient.FullName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        <Mail style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {patient.email || patient.Email || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <Phone style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {patient.phone || patient.Phone || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        {patient.patientIDNumber || patient.PatientIDNumber || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        {patient.age || patient.Age || 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        <span style={styles.categoryBadge}>
                          {patient.category || patient.Category || 'N/A'}
                        </span>
                      </div>
                      <div style={styles.tableCell}>
                        {patient.gender || patient.Gender || 'N/A'}
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

export default AdminPatientsPage;
