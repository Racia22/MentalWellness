import React, { useState } from 'react';
import { Plus, FileText, Calendar, User, X } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import doctorService from '../../api/services/doctorService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const DoctorMedicalRecordsPage = () => {
  const { user } = useAuth();
  const { records = [], loading, createRecord } = useMedicalRecords({ doctorId: user?.userId });
  const { sidebarOpen, toggleSidebar } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    recordDate: new Date().toISOString().split('T')[0],
    recordType: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

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
    recordsList: {
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
      transition: 'all 0.3s',
    },
    recordHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    recordTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    recordType: {
      padding: '0.25rem 0.75rem',
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    recordDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6B7280',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    recordDetail: {
      color: '#6B7280',
      fontSize: '0.875rem',
      marginBottom: '0.75rem',
    },
    recordLabel: {
      fontWeight: '600',
      color: '#0A1D56',
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
      fontFamily: 'inherit',
    },
    textarea: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      minHeight: '120px',
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
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get Doctor ID from User ID
      const currentUserId = user?.userId || user?.UserId;
      if (!currentUserId) {
        handleError(new Error('User ID not found'), 'Please log in again');
        return;
      }

      let doctorId;
      try {
        const doctorData = await doctorService.getDoctorByUserId(currentUserId);
        doctorId = doctorData.doctorId || doctorData.DoctorId;
        if (!doctorId) {
          handleError(new Error('Doctor profile not found'), 'Doctor profile not found. Please contact support.');
          return;
        }
      } catch (error) {
        console.error('Failed to get doctor data:', error);
        handleError(error, 'Failed to get doctor information. Please try again.');
        return;
      }

      // Validate Patient ID is a valid GUID
      const patientIdStr = formData.patientId?.trim();
      if (!patientIdStr) {
        handleError(new Error('Patient ID is required'), 'Please enter a Patient ID');
        return;
      }

      // Validate GUID format
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(patientIdStr)) {
        handleError(new Error('Invalid Patient ID format'), 'Patient ID must be a valid GUID format');
        return;
      }

      // Map form data to backend DTO format
      const recordData = {
        PatientId: patientIdStr, // Use PatientId (from Patient table)
        DoctorId: doctorId, // Use DoctorId (from Doctor table)
        AppointmentId: null, // Optional - can be added later
        Diagnosis: formData.diagnosis || null,
        PrescriptionDetails: formData.treatment || null, // Map treatment to PrescriptionDetails
        SessionNotes: formData.notes || null, // Map notes to SessionNotes
        ChiefComplaint: null, // Can be added to form later
        VitalSigns: null, // Can be added to form later
        Attachments: null, // Can be added to form later
      };

      await createRecord(recordData);
      handleSuccess('Medical record created successfully');
      setShowModal(false);
      setFormData({
        patientId: '',
        recordDate: new Date().toISOString().split('T')[0],
        recordType: '',
        diagnosis: '',
        treatment: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating medical record:', error);
      handleError(error, 'Failed to create medical record');
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
              <div>
                <h1 style={styles.title}>Medical Records</h1>
                <p style={styles.subtitle}>Create and manage patient medical records</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={styles.addButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                Create Record
              </button>
            </div>

            {records?.length === 0 ? (
              <EmptyState
                message="You haven't created any medical records yet. Create your first record to get started."
                icon="📋"
              />
            ) : (
              <div style={styles.recordsList}>
                {records.map((record) => (
                  <div
                    key={record.medicalRecordId}
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
                      <h3 style={styles.recordTitle}>
                        <User style={{ width: '1.25rem', height: '1.25rem' }} />
                        {record.patientName || 'Patient'}
                      </h3>
                      <span style={styles.recordType}>{record.recordType || 'General'}</span>
                    </div>
                    <p style={styles.recordDate}>
                      <Calendar style={{ width: '1rem', height: '1rem' }} />
                      {formatDate(record.recordDate)}
                    </p>
                    {record.diagnosis && (
                      <p style={styles.recordDetail}>
                        <span style={styles.recordLabel}>Diagnosis:</span> {record.diagnosis}
                      </p>
                    )}
                    {record.treatment && (
                      <p style={styles.recordDetail}>
                        <span style={styles.recordLabel}>Treatment:</span> {record.treatment}
                      </p>
                    )}
                    {record.notes && (
                      <p style={styles.recordDetail}>
                        <span style={styles.recordLabel}>Notes:</span> {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Record Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create Medical Record</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Patient ID</label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Record Date</label>
                <input
                  type="date"
                  name="recordDate"
                  value={formData.recordDate}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Record Type</label>
                <select
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Diagnosis</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Treatment</label>
                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter treatment"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  style={styles.textarea}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter clinical notes..."
                />
              </div>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecordsPage;
