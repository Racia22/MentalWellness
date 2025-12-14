import React, { useState, useEffect } from 'react';
import { Plus, ClipboardList, Calendar, User, X, CheckCircle, Clock } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useTreatmentPlans } from '../../hooks/useTreatmentPlans';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import doctorService from '../../api/services/doctorService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const DoctorTreatmentPlansPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const { plans = [], loading, createPlan } = useTreatmentPlans({ doctorId: doctorId });
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  useEffect(() => {
    const fetchDoctorId = async () => {
      if (!user) {
        setLoadingDoctor(false);
        return;
      }

      try {
        const currentUserId = user?.userId || user?.UserId;
        if (!currentUserId) {
          setLoadingDoctor(false);
          return;
        }

        const doctorData = await doctorService.getDoctorByUserId(currentUserId);
        const id = doctorData.doctorId || doctorData.DoctorId;
        if (id) {
          setDoctorId(id);
        }
      } catch (error) {
        console.error('Failed to get doctor data:', error);
      } finally {
        setLoadingDoctor(false);
      }
    };

    fetchDoctorId();
  }, [user]);

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
    plansList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
    },
    planCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    planHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    planTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
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
    badgeActive: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    badgeCompleted: {
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
    },
    badgePaused: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    planDetail: {
      color: '#6B7280',
      fontSize: '0.875rem',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    planLabel: {
      fontWeight: '600',
      color: '#0A1D56',
    },
    planDescription: {
      color: '#6B7280',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
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

      // Validate Title
      if (!formData.title || !formData.title.trim()) {
        handleError(new Error('Title is required'), 'Please enter a title for the treatment plan');
        return;
      }

      // Validate Start Date
      if (!formData.startDate) {
        handleError(new Error('Start date is required'), 'Please select a start date');
        return;
      }

      // Map form data to backend DTO format (PascalCase)
      const planData = {
        PatientId: patientIdStr, // Use PatientId (from Patient table)
        DoctorId: doctorId, // Use DoctorId (from Doctor table)
        AppointmentId: null, // Optional - can be added later
        MedicalRecordId: null, // Optional - can be added later
        Title: formData.title.trim(),
        Description: formData.description?.trim() || null,
        Goals: null, // Can be added to form later
        Tasks: null, // Can be added to form later
        StartDate: new Date(formData.startDate).toISOString(),
        EndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      await createPlan(planData);
      handleSuccess('Treatment plan created successfully');
      setShowModal(false);
      setFormData({
        patientId: '',
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      handleError(error, 'Failed to create treatment plan');
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      Active: { ...styles.badge, ...styles.badgeActive },
      Completed: { ...styles.badge, ...styles.badgeCompleted },
      Paused: { ...styles.badge, ...styles.badgePaused },
    };
    return badgeStyles[status] || styles.badge;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Paused':
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
      default:
        return null;
    }
  };

  if (loading || loadingDoctor) {
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
                <h1 style={styles.title}>Treatment Plans</h1>
                <p style={styles.subtitle}>Create and manage patient treatment plans</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={styles.addButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                Create Plan
              </button>
            </div>

            {plans?.length === 0 ? (
              <EmptyState
                message="You haven't created any treatment plans yet. Create your first plan to get started."
                icon="📋"
              />
            ) : (
              <div style={styles.plansList}>
                {plans.map((plan) => (
                  <div
                    key={plan.treatmentPlanId || plan.TreatmentPlanId}
                    style={styles.planCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.planHeader}>
                      <h3 style={styles.planTitle}>
                        <ClipboardList style={{ width: '1.25rem', height: '1.25rem', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        {plan.title || plan.Title || 'Treatment Plan'}
                      </h3>
                      {(plan.status || plan.Status) && (
                        <span style={getStatusBadge(plan.status || plan.Status)}>
                          {getStatusIcon(plan.status || plan.Status)}
                          {plan.status || plan.Status}
                        </span>
                      )}
                    </div>
                    {(plan.patientName || plan.PatientName) && (
                      <div style={styles.planDetail}>
                        <User style={{ width: '1rem', height: '1rem' }} />
                        <span style={styles.planLabel}>Patient:</span>
                        <span>{plan.patientName || plan.PatientName}</span>
                      </div>
                    )}
                    {(plan.startDate || plan.StartDate) && (
                      <div style={styles.planDetail}>
                        <Calendar style={{ width: '1rem', height: '1rem' }} />
                        <span style={styles.planLabel}>Start Date:</span>
                        <span>{formatDate(plan.startDate || plan.StartDate)}</span>
                      </div>
                    )}
                    {(plan.endDate || plan.EndDate) && (
                      <div style={styles.planDetail}>
                        <Calendar style={{ width: '1rem', height: '1rem' }} />
                        <span style={styles.planLabel}>End Date:</span>
                        <span>{formatDate(plan.endDate || plan.EndDate)}</span>
                      </div>
                    )}
                    {(plan.description || plan.Description) && (
                      <p style={styles.planDescription}>{plan.description || plan.Description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Plan Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create Treatment Plan</h2>
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
                  placeholder="Enter patient ID"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
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
                  placeholder="Enter plan title"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
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
                <label style={styles.label}>End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
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
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
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
                  placeholder="Enter plan description, goals, and tasks..."
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
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTreatmentPlansPage;
