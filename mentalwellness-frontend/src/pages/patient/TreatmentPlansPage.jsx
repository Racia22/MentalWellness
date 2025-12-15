import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Calendar, User, CheckCircle, Clock, Pause, X, Target, ListChecks } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useTreatmentPlans } from '../../hooks/useTreatmentPlans';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import patientService from '../../api/services/patientService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';

const TreatmentPlansPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patientId, setPatientId] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const { plans = [], loading } = useTreatmentPlans({ patientId: patientId });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
        if (id) {
          setPatientId(id);
        }
      } catch (error) {
        console.error('Failed to get patient data:', error);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientId();
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
    plansGrid: {
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
      marginBottom: '0.5rem',
    },
    planDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6B7280',
      fontSize: '0.875rem',
    },
    detailValue: {
      color: '#0A1D56',
      fontWeight: '500',
    },
    planDescription: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
      color: '#6B7280',
      fontSize: '0.875rem',
      lineHeight: '1.6',
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
  };

  const filteredPlans = useMemo(() => {
    if (!plans || !Array.isArray(plans)) return [];
    return plans.filter((plan) => {
      const title = plan.title || plan.Title || '';
      const description = plan.description || plan.Description || '';
      const doctorName = plan.doctorName || plan.DoctorName || '';
      const status = plan.status || plan.Status || '';
      
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'All' || status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, filterStatus]);

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
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem' }} />;
      case 'Paused':
        return <Pause style={{ width: '1rem', height: '1rem' }} />;
      default:
        return <Clock style={{ width: '1rem', height: '1rem' }} />;
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>My Treatment Plans</h1>
              <p style={styles.subtitle}>View your treatment plans and progress</p>
            </div>

            {/* Search and Filters */}
            <div style={styles.filtersCard}>
              <div style={styles.filtersRow}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by title, description, or doctor name..."
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
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Treatment Plans Grid */}
            {filteredPlans.length === 0 ? (
              <EmptyState
                message={plans?.length === 0 ? "No treatment plans yet. Your doctor will create a plan for you." : "No plans match your search criteria."}
                icon="📋"
              />
            ) : (
              <div style={styles.plansGrid}>
                {filteredPlans.map((plan) => {
                  const planId = plan.treatmentPlanId || plan.TreatmentPlanId;
                  const title = plan.title || plan.Title || 'Treatment Plan';
                  const description = plan.description || plan.Description;
                  const doctorName = plan.doctorName || plan.DoctorName;
                  const status = plan.status || plan.Status;
                  const startDate = plan.startDate || plan.StartDate;
                  const endDate = plan.endDate || plan.EndDate;

                  return (
                    <div
                      key={planId}
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
                        <div style={{ flex: 1 }}>
                          <h3 style={styles.planTitle}>{title}</h3>
                        </div>
                        {status && (
                          <span style={getStatusBadge(status)}>
                            {getStatusIcon(status)}
                            {status}
                          </span>
                        )}
                      </div>
                      <div style={styles.planDetails}>
                        {doctorName && (
                          <div style={styles.detailItem}>
                            <User style={{ width: '1rem', height: '1rem' }} />
                            <span>Doctor:</span>
                            <span style={styles.detailValue}>{doctorName}</span>
                          </div>
                        )}
                        {startDate && (
                          <div style={styles.detailItem}>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            <span>Start Date:</span>
                            <span style={styles.detailValue}>{formatDate(startDate)}</span>
                          </div>
                        )}
                        {endDate && (
                          <div style={styles.detailItem}>
                            <Calendar style={{ width: '1rem', height: '1rem' }} />
                            <span>End Date:</span>
                            <span style={styles.detailValue}>{formatDate(endDate)}</span>
                          </div>
                        )}
                      </div>
                      {description && (
                        <div style={styles.planDescription}>
                          <FileText style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                          {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowDetailsModal(true);
                        }}
                        style={{
                          marginTop: '1rem',
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#1E40AF',
                          color: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563EB';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1E40AF';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Treatment Plan Details Modal */}
            {showDetailsModal && selectedPlan && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem',
              }}
              onClick={() => setShowDetailsModal(false)}
              >
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      color: '#0A1D56',
                    }}>
                      {selectedPlan.title || selectedPlan.Title || 'Treatment Plan'}
                    </h2>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <X style={{ width: '1.5rem', height: '1.5rem', color: '#6B7280' }} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Description */}
                    {selectedPlan.description && (
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Description
                        </h3>
                        <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
                          {selectedPlan.description || selectedPlan.Description}
                        </p>
                      </div>
                    )}

                    {/* Goals */}
                    {selectedPlan.goals && (
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0A1D56', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Target style={{ width: '1.25rem', height: '1.25rem' }} />
                          Goals
                        </h3>
                        <p style={{ color: '#6B7280', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {selectedPlan.goals || selectedPlan.Goals}
                        </p>
                      </div>
                    )}

                    {/* Tasks */}
                    {selectedPlan.tasks && (
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0A1D56', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ListChecks style={{ width: '1.25rem', height: '1.25rem' }} />
                          Tasks
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {(() => {
                            try {
                              const tasks = typeof selectedPlan.tasks === 'string' 
                                ? JSON.parse(selectedPlan.tasks || selectedPlan.Tasks || '[]')
                                : (selectedPlan.tasks || selectedPlan.Tasks || []);
                              if (Array.isArray(tasks) && tasks.length > 0) {
                                return tasks.map((task, idx) => (
                                  <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '0.5rem',
                                  }}>
                                    <input
                                      type="checkbox"
                                      checked={task.isCompleted || false}
                                      disabled
                                      style={{
                                        marginTop: '0.25rem',
                                        width: '1.25rem',
                                        height: '1.25rem',
                                        cursor: 'not-allowed',
                                      }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <p style={{
                                        color: task.isCompleted ? '#6B7280' : '#0A1D56',
                                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                                        fontWeight: task.isCompleted ? '400' : '500',
                                      }}>
                                        {task.taskName || task.name || task}
                                      </p>
                                      {task.description && (
                                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ));
                              } else {
                                return <p style={{ color: '#6B7280' }}>No tasks assigned yet.</p>;
                              }
                            } catch (e) {
                              return <p style={{ color: '#6B7280' }}>Unable to parse tasks.</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Progress Notes */}
                    {selectedPlan.progressNotes && (
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Progress Notes
                        </h3>
                        <p style={{ color: '#6B7280', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {selectedPlan.progressNotes || selectedPlan.ProgressNotes}
                        </p>
                      </div>
                    )}

                    {/* Dates and Doctor */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '0.5rem',
                    }}>
                      {selectedPlan.doctorName && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Doctor</p>
                          <p style={{ fontWeight: '600', color: '#0A1D56' }}>
                            {selectedPlan.doctorName || selectedPlan.DoctorName}
                          </p>
                        </div>
                      )}
                      {selectedPlan.startDate && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Start Date</p>
                          <p style={{ fontWeight: '600', color: '#0A1D56' }}>
                            {formatDate(selectedPlan.startDate || selectedPlan.StartDate)}
                          </p>
                        </div>
                      )}
                      {selectedPlan.endDate && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>End Date</p>
                          <p style={{ fontWeight: '600', color: '#0A1D56' }}>
                            {formatDate(selectedPlan.endDate || selectedPlan.EndDate)}
                          </p>
                        </div>
                      )}
                      {selectedPlan.status && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Status</p>
                          <span style={getStatusBadge(selectedPlan.status || selectedPlan.Status)}>
                            {getStatusIcon(selectedPlan.status || selectedPlan.Status)}
                            {selectedPlan.status || selectedPlan.Status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TreatmentPlansPage;
