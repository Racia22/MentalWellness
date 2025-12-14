import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, User } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError } from '../../utils/errorHandler';
import toast from 'react-hot-toast';

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patientId, setPatientId] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patientName, setPatientName] = useState('');
  const { records = [], loading } = useMedicalRecords({ patientId: patientId });

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
        const name = patientData.fullName || patientData.FullName || user?.fullName || user?.FullName || '';
        if (id) {
          setPatientId(id);
        }
        if (name) {
          setPatientName(name);
        }
      } catch (error) {
        console.error('Failed to get patient data:', error);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientId();
  }, [user]);

  const handleDownloadRecord = (record) => {
    try {
      // Extract all record data with fallbacks for property naming
      const recordId = record.medicalRecordId || record.MedicalRecordId;
      const recordDate = record.createdAt || record.CreatedAt;
      const diagnosis = record.diagnosis || record.Diagnosis;
      const sessionNotes = record.sessionNotes || record.SessionNotes;
      const prescriptionDetails = record.prescriptionDetails || record.PrescriptionDetails;
      const doctorName = record.doctorName || record.DoctorName;
      const recordPatientName = record.patientName || record.PatientName || patientName;
      const chiefComplaint = record.chiefComplaint || record.ChiefComplaint;
      const vitalSigns = record.vitalSigns || record.VitalSigns;
      const appointmentId = record.appointmentId || record.AppointmentId;

      // Format the date
      const formattedDate = recordDate ? formatDate(recordDate) : 'Date not available';
      
      // Create the content for the file
      let content = '═══════════════════════════════════════════════════════════\n';
      content += '                    MEDICAL RECORD\n';
      content += '═══════════════════════════════════════════════════════════\n\n';
      
      content += `Record ID: ${recordId || 'N/A'}\n`;
      content += `Date: ${formattedDate}\n\n`;
      
      if (recordPatientName) {
        content += `Patient: ${recordPatientName}\n`;
      }
      if (doctorName) {
        content += `Doctor: ${doctorName}\n`;
      }
      if (appointmentId) {
        content += `Appointment ID: ${appointmentId}\n`;
      }
      content += '\n';
      content += '═══════════════════════════════════════════════════════════\n\n';

      if (chiefComplaint) {
        content += 'CHIEF COMPLAINT:\n';
        content += '─────────────────────────────────────────────────────────\n';
        content += `${chiefComplaint}\n\n`;
      }

      if (diagnosis) {
        content += 'DIAGNOSIS:\n';
        content += '─────────────────────────────────────────────────────────\n';
        content += `${diagnosis}\n\n`;
      }

      if (prescriptionDetails) {
        content += 'TREATMENT / PRESCRIPTION:\n';
        content += '─────────────────────────────────────────────────────────\n';
        content += `${prescriptionDetails}\n\n`;
      }

      if (sessionNotes) {
        content += 'SESSION NOTES:\n';
        content += '─────────────────────────────────────────────────────────\n';
        content += `${sessionNotes}\n\n`;
      }

      if (vitalSigns) {
        content += 'VITAL SIGNS:\n';
        content += '─────────────────────────────────────────────────────────\n';
        try {
          const vitalSignsObj = typeof vitalSigns === 'string' ? JSON.parse(vitalSigns) : vitalSigns;
          content += JSON.stringify(vitalSignsObj, null, 2) + '\n\n';
        } catch (e) {
          content += `${vitalSigns}\n\n`;
        }
      }

      content += '═══════════════════════════════════════════════════════════\n';
      content += `Generated on: ${new Date().toLocaleString()}\n`;
      content += '═══════════════════════════════════════════════════════════\n';

      // Create a blob with the content
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      const fileName = `medical-record-${recordId || 'record'}-${formattedDate.replace(/\s/g, '-')}.txt`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Medical record downloaded successfully');
    } catch (error) {
      console.error('Error downloading medical record:', error);
      handleError(error, 'Failed to download medical record');
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
    recordsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '1.5rem',
    },
    recordCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    recordHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '1rem',
    },
    recordIconContainer: {
      width: '3rem',
      height: '3rem',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '0.75rem',
    },
    recordInfo: {
      flex: 1,
    },
    recordType: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    recordDate: {
      fontSize: '0.875rem',
      color: '#6B7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    recordDescription: {
      color: '#6B7280',
      marginBottom: '1rem',
      lineHeight: '1.6',
    },
    recordDoctor: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    doctorName: {
      fontWeight: '500',
      color: '#0A1D56',
    },
    downloadButton: {
      padding: '0.75rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: '#1E40AF',
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

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Medical Records</h1>
              <p style={styles.subtitle}>View and download your medical records</p>
            </div>

            {records && records.length > 0 ? (
              <div style={styles.recordsGrid}>
                {records.map((record) => {
                  const recordId = record.medicalRecordId || record.MedicalRecordId;
                  const recordDate = record.createdAt || record.CreatedAt;
                  const diagnosis = record.diagnosis || record.Diagnosis;
                  const sessionNotes = record.sessionNotes || record.SessionNotes;
                  const prescriptionDetails = record.prescriptionDetails || record.PrescriptionDetails;
                  const doctorName = record.doctorName || record.DoctorName;
                  const chiefComplaint = record.chiefComplaint || record.ChiefComplaint;

                  return (
                    <div
                      key={recordId}
                      style={styles.recordCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={styles.recordHeader}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                          <div style={styles.recordIconContainer}>
                            <FileText style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                          </div>
                          <div style={styles.recordInfo}>
                            <h3 style={styles.recordType}>Medical Record</h3>
                            <p style={styles.recordDate}>
                              <Calendar style={{ width: '1rem', height: '1rem' }} />
                              {recordDate ? formatDate(recordDate) : 'Date not available'}
                            </p>
                          </div>
                        </div>
                        <button
                          style={styles.downloadButton}
                          onClick={() => handleDownloadRecord(record)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Download record"
                        >
                          <Download style={{ width: '1.25rem', height: '1.25rem' }} />
                        </button>
                      </div>
                      {chiefComplaint && (
                        <p style={styles.recordDescription}>
                          <strong style={{ color: '#0A1D56' }}>Chief Complaint:</strong> {chiefComplaint}
                        </p>
                      )}
                      {diagnosis && (
                        <p style={{ ...styles.recordDescription, marginTop: chiefComplaint ? '0.5rem' : 0 }}>
                          <strong style={{ color: '#0A1D56' }}>Diagnosis:</strong> {diagnosis}
                        </p>
                      )}
                      {prescriptionDetails && (
                        <p style={{ ...styles.recordDescription, marginTop: (chiefComplaint || diagnosis) ? '0.5rem' : 0 }}>
                          <strong style={{ color: '#0A1D56' }}>Treatment:</strong> {prescriptionDetails}
                        </p>
                      )}
                      {sessionNotes && (
                        <p style={{ ...styles.recordDescription, marginTop: (chiefComplaint || diagnosis || prescriptionDetails) ? '0.5rem' : 0 }}>
                          <strong style={{ color: '#0A1D56' }}>Notes:</strong> {sessionNotes}
                        </p>
                      )}
                      {!chiefComplaint && !diagnosis && !prescriptionDetails && !sessionNotes && (
                        <p style={styles.recordDescription}>
                          No details available for this record.
                        </p>
                      )}
                      {doctorName && (
                        <p style={{ ...styles.recordDoctor, marginTop: '1rem' }}>
                          <User style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          Doctor: <span style={styles.doctorName}>{doctorName}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                message="No medical records available. Your doctor will add records after your sessions."
                icon="📋"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
