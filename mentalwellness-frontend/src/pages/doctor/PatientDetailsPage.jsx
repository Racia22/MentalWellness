import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, ClipboardList, Activity } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Button from '../../components/common/Button/Button';
import Avatar from '../../components/common/Avatar/Avatar';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useTreatmentPlans } from '../../hooks/useTreatmentPlans';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import { formatDate } from '../../utils/formatters';
import { handleError } from '../../utils/errorHandler';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Only fetch related data if we have a valid patient ID
  const isValidId = id && id !== 'undefined' && id !== 'null';
  const { records = [] } = useMedicalRecords({ patientId: isValidId ? id : null });
  const { plans = [] } = useTreatmentPlans({ patientId: isValidId ? id : null });
  const { logs = [] } = useMoodLogs({ patientId: isValidId ? id : null });

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
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    profileCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '2rem',
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    profileEmail: {
      color: '#6B7280',
      fontSize: '1rem',
      marginTop: '0.25rem',
    },
    profileDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: '1rem',
      borderBottom: '1px solid #f3f4f6',
    },
    dataCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    dataTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
    },
  };

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        setError('Invalid patient ID');
        setLoading(false);
        return;
      }

      try {
        const data = await patientService.getPatientById(id);
        setPatient(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load patient:', error);
        // Don't show error toast for 404 - just set error state
        if (error.response?.status === 404 || error.response?.status === 403) {
          setError('Patient not found or you do not have access to this patient.');
        } else {
          handleError(error, 'Failed to load patient');
          setError('Failed to load patient details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

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

  if (!patient && !loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}>
            <div style={styles.container}>
              <div style={styles.header}>
                <button
                  onClick={() => navigate('/doctor/patients')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#374151',
                  }}
                >
                  <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                  Back
                </button>
                <h1 style={styles.title}>Patient Details</h1>
              </div>
              <div style={styles.profileCard}>
                <p style={{ color: '#DC2626', fontSize: '1rem' }}>
                  {error || 'Patient not found'}
                </p>
              </div>
            </div>
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
              <button
                onClick={() => navigate('/doctor/patients')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                Back
              </button>
              <h1 style={styles.title}>Patient Details</h1>
            </div>

            <div style={styles.profileCard}>
              <div style={styles.profileHeader}>
                <Avatar name={patient.fullName} size="xl" />
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0A1D56', marginBottom: '0.25rem' }}>
                    {patient.fullName}
                  </h2>
                  <p style={styles.profileEmail}>{patient.email}</p>
                </div>
              </div>
              <div style={styles.profileDetails}>
                <div style={styles.detailRow}>
                  <strong style={{ color: '#0A1D56' }}>Age:</strong>
                  <span style={{ color: '#6B7280' }}>{patient.age || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong style={{ color: '#0A1D56' }}>Gender:</strong>
                  <span style={{ color: '#6B7280' }}>{patient.gender || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong style={{ color: '#0A1D56' }}>Phone:</strong>
                  <span style={{ color: '#6B7280' }}>{patient.phone || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <strong style={{ color: '#0A1D56' }}>Date of Birth:</strong>
                  <span style={{ color: '#6B7280' }}>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}</span>
                </div>
                <div style={{ ...styles.detailRow, borderBottom: 'none', paddingBottom: 0 }}>
                  <strong style={{ color: '#0A1D56' }}>Address:</strong>
                  <span style={{ color: '#6B7280' }}>{patient.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <div style={styles.dataCard}>
                <h3 style={styles.dataTitle}>
                  <FileText style={{ width: '1.25rem', height: '1.25rem' }} />
                  Medical Records ({records?.length || 0})
                </h3>
                {records && records.length > 0 ? (
                  <div style={styles.list}>
                    {records.slice(0, 5).map((record) => (
                      <div key={record.medicalRecordId} style={styles.listItem}>
                        <span style={{ color: '#6B7280' }}>{formatDate(record.recordDate)}</span>
                        <span style={{ color: '#0A1D56', fontWeight: '500' }}>{record.diagnosis || 'No diagnosis'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280' }}>No medical records</p>
                )}
              </div>

              <div style={styles.dataCard}>
                <h3 style={styles.dataTitle}>
                  <ClipboardList style={{ width: '1.25rem', height: '1.25rem' }} />
                  Treatment Plans ({plans?.length || 0})
                </h3>
                {plans && plans.length > 0 ? (
                  <div style={styles.list}>
                    {plans.slice(0, 5).map((plan) => (
                      <div key={plan.treatmentPlanId} style={styles.listItem}>
                        <span style={{ color: '#0A1D56', fontWeight: '500' }}>{plan.title}</span>
                        <span style={{ color: '#6B7280' }}>{plan.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280' }}>No treatment plans</p>
                )}
              </div>

              <div style={styles.dataCard}>
                <h3 style={styles.dataTitle}>
                  <Activity style={{ width: '1.25rem', height: '1.25rem' }} />
                  Mood Logs ({logs?.length || 0})
                </h3>
                {logs && logs.length > 0 ? (
                  <div style={styles.list}>
                    {logs.slice(0, 5).map((log) => {
                      const logDate = log.logDate || log.LogDate;
                      const moodScore = log.moodScore || log.MoodScore || 0;
                      // Map mood score to mood string
                      let mood = 'N/A';
                      if (moodScore >= 9) mood = 'Excellent';
                      else if (moodScore >= 7) mood = 'Good';
                      else if (moodScore >= 5) mood = 'Neutral';
                      else if (moodScore >= 3) mood = 'Poor';
                      else if (moodScore >= 1) mood = 'Very Poor';
                      
                      return (
                        <div key={log.moodLogId || log.MoodLogId} style={styles.listItem}>
                          <span style={{ color: '#6B7280' }}>{formatDate(logDate)}</span>
                          <span style={{ color: '#0A1D56', fontWeight: '500' }}>{mood} ({moodScore}/10)</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#6B7280' }}>No mood logs</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDetailsPage;

