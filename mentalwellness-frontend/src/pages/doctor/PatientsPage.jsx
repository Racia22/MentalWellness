import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Avatar from '../../components/common/Avatar/Avatar';
import Button from '../../components/common/Button/Button';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { handleError } from '../../utils/errorHandler';

const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments = [] } = useAppointments({ doctorUserId: user?.userId });
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

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
    searchSection: {
      marginBottom: '2rem',
    },
    searchWrapper: {
      position: 'relative',
      maxWidth: '400px',
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
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    patientsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    patientCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    patientHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    patientEmail: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    patientDetails: {
      marginBottom: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
    },
    detailItem: {
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '0.5rem',
    },
    detailLabel: {
      fontWeight: '600',
      color: '#0A1D56',
    },
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getAllPatients();
        // Filter to only show patients with appointments
        if (appointments && Array.isArray(appointments)) {
          const patientIds = new Set(appointments.map(apt => apt.patientId || apt.PatientId));
          const filteredPatients = data.filter(p => {
            const id = p.patientId || p.PatientId;
            return patientIds.has(id);
          });
          setPatients(filteredPatients);
        } else {
          setPatients(data || []);
        }
      } catch (error) {
        console.error('Failed to load patients:', error);
        handleError(error, 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [appointments]);

  const filteredPatients = patients.filter((patient) =>
    patient.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    patient.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

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
              <h1 style={styles.title}>My Patients</h1>
              <p style={styles.subtitle}>Manage your patient list</p>
            </div>

            <div style={styles.searchSection}>
              <div style={styles.searchWrapper}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patients by name or email..."
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
            </div>

            {filteredPatients.length === 0 ? (
              <EmptyState
                message={patients.length === 0 ? "You don't have any patients yet." : "No patients match your search criteria."}
                icon="👥"
              />
            ) : (
              <div style={styles.patientsGrid}>
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.patientId}
                    style={styles.patientCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.patientHeader}>
                      <Avatar name={patient.fullName} size="large" />
                      <div style={styles.patientInfo}>
                        <h3 style={styles.patientName}>
                          <User style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          {patient.fullName}
                        </h3>
                        <p style={styles.patientEmail}>{patient.email}</p>
                      </div>
                    </div>
                    <div style={styles.patientDetails}>
                      <p style={styles.detailItem}>
                        <span style={styles.detailLabel}>Age:</span> {patient.age || 'N/A'}
                      </p>
                      <p style={styles.detailItem}>
                        <span style={styles.detailLabel}>Gender:</span> {patient.gender || 'N/A'}
                      </p>
                      <p style={styles.detailItem}>
                        <span style={styles.detailLabel}>Phone:</span> {patient.phone || 'N/A'}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const patientId = patient.patientId || patient.PatientId;
                        if (patientId) {
                          navigate(`/doctor/patients/${patientId}`);
                        } else {
                          handleError(new Error('Invalid patient ID'), 'Cannot view patient details');
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      View Details
                    </Button>
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

export default DoctorPatientsPage;
