import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Stethoscope, Calendar } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import doctorService from '../../api/services/doctorService';
import adminService from '../../api/services/adminService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminDoctorsPage = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('pending'); // Default to 'pending' to show unapproved doctors first
  const [error, setError] = useState(null);
  const { sidebarOpen, toggleSidebar } = useApp();

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      console.log('Fetching all doctor users...');
      
      // Use admin service to get all doctor users (including those without Doctor records)
      // Note: axios interceptor already extracts response.data, so response is the data array
      const response = await adminService.getAllDoctorUsers();
      
      console.log('Raw response from getAllDoctorUsers:', response);
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      
      // Axios interceptor returns response.data directly, so response should be the array
      let data = response;
      
      // Handle case where response might be wrapped (though interceptor should prevent this)
      if (!Array.isArray(data)) {
        if (data?.data && Array.isArray(data.data)) {
          console.warn('Response was wrapped, extracting .data');
          data = data.data;
        } else {
          console.error('Unexpected response format. Expected array, got:', typeof data, data);
          data = [];
        }
      }
      
      console.log('Extracted doctor users data:', data);
      console.log('Total doctor users:', data.length);
      console.log('Data type:', Array.isArray(data) ? 'Array' : typeof data);
      
      if (data.length > 0) {
        console.log('First doctor sample:', data[0]);
        console.log('First doctor keys:', Object.keys(data[0]));
      }
      
      // Count pending (not approved) doctors - handle both camelCase and PascalCase
      const pendingCount = data.filter(d => {
        const isApproved = d.isApproved !== undefined ? d.isApproved : (d.IsApproved !== undefined ? d.IsApproved : false);
        return !isApproved;
      }).length;
      
      console.log('Pending approvals:', pendingCount);
      console.log('Approved doctors:', data.length - pendingCount);
      
      // Log each doctor for debugging
      data.forEach((doctor, index) => {
        const isApproved = doctor.isApproved !== undefined ? doctor.isApproved : (doctor.IsApproved !== undefined ? doctor.IsApproved : false);
        const hasProfile = doctor.hasProfile !== undefined ? doctor.hasProfile : (doctor.HasProfile !== undefined ? doctor.HasProfile : true);
        console.log(`Doctor ${index + 1}:`, {
          name: doctor.fullName || doctor.FullName,
          email: doctor.email || doctor.Email,
          isApproved,
          IsApproved: doctor.IsApproved,
          isApproved_lower: doctor.isApproved,
          hasProfile,
          HasProfile: doctor.HasProfile,
          hasProfile_lower: doctor.hasProfile,
          doctorId: doctor.doctorId || doctor.DoctorId,
          userId: doctor.userId || doctor.UserId,
          specialty: doctor.specialty || doctor.Specialty
        });
      });
      
      setDoctors(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load doctors';
      setError(`Error: ${errorMessage}. Check the browser console (F12) for details.`);
      handleError(error, 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctor) => {
    try {
      const doctorId = doctor.doctorId || doctor.DoctorId;
      
      // If user doesn't have a Doctor record yet, they need to complete their profile first
      if (!doctorId && (doctor.hasProfile === false || doctor.HasProfile === false)) {
        handleError(new Error('Doctor profile not completed'), 'Doctor must complete their profile before approval. Please ask the doctor to complete their profile first.');
        return;
      }
      
      await doctorService.approveDoctor(doctorId);
      handleSuccess('Doctor approved successfully');
      fetchDoctors(); // Refresh the list
    } catch (error) {
      handleError(error, 'Failed to approve doctor');
    }
  };

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
      marginBottom: '0.5rem',
      color: '#0A1D56',
    },
    filterGroup: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    filterButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '2px solid #e5e7eb',
      backgroundColor: '#FFFFFF',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s',
    },
    filterButtonActive: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderColor: '#1E40AF',
    },
    doctorsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
    },
    doctorCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    doctorHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    avatar: {
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '50%',
      backgroundColor: '#1E40AF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: '1.25rem',
      fontWeight: '600',
      flexShrink: 0,
    },
    doctorInfo: {
      flex: 1,
    },
    doctorName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    doctorSpecialty: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    statusPending: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    statusApproved: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    doctorDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    detailIcon: {
      width: '1rem',
      height: '1rem',
      color: '#1E40AF',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1rem',
    },
    approveButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#10b981',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },
    rejectButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#ef4444',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter doctors client-side based on approval status
  // Handle both camelCase and PascalCase property names
  const filteredDoctors = doctors.filter(doctor => {
    // Check approval status - handle both camelCase and PascalCase
    const isApproved = doctor.isApproved !== undefined 
      ? doctor.isApproved 
      : (doctor.IsApproved !== undefined ? doctor.IsApproved : false);
    
    // For pending filter, show doctors that are NOT approved
    // This includes:
    // 1. Doctors with profiles where IsApproved = false
    // 2. Users with Doctor role but no Doctor profile yet (HasProfile = false, IsApproved = false)
    if (filter === 'pending') {
      return !isApproved; // Show all unapproved doctors
    } else if (filter === 'approved') {
      return isApproved === true; // Show only approved doctors
    }
    // Show all doctors for 'all' filter
    return true;
  });
  
  // Calculate counts for filter buttons
  const pendingCount = doctors.filter(d => {
    const isApproved = d.isApproved !== undefined ? d.isApproved : (d.IsApproved !== undefined ? d.IsApproved : false);
    return !isApproved;
  }).length;
  
  const approvedCount = doctors.filter(d => {
    const isApproved = d.isApproved !== undefined ? d.isApproved : (d.IsApproved !== undefined ? d.IsApproved : false);
    return isApproved === true;
  }).length;

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
                <h1 style={styles.title}>Doctor Approvals</h1>
                <p style={{ color: '#6B7280' }}>Manage doctor registrations and approvals</p>
                {error && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: '#FEE2E2', 
                    border: '1px solid #FCA5A5', 
                    borderRadius: '0.5rem', 
                    color: '#991B1B',
                    fontSize: '0.875rem'
                  }}>
                    {error}
                  </div>
                )}
              </div>
              <div style={styles.filterGroup}>
                <button
                  onClick={() => {
                    setFilter('all');
                    fetchDoctors();
                  }}
                  style={{
                    ...styles.filterButton,
                    ...(filter === 'all' ? styles.filterButtonActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== 'all') {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== 'all') {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  All Doctors ({doctors.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  style={{
                    ...styles.filterButton,
                    ...(filter === 'pending' ? styles.filterButtonActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== 'pending') {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== 'pending') {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  style={{
                    ...styles.filterButton,
                    ...(filter === 'approved' ? styles.filterButtonActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== 'approved') {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== 'approved') {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }
                  }}
                >
                  Approved ({approvedCount})
                </button>
              </div>
            </div>

            {doctors.length === 0 ? (
              <EmptyState
                message="No doctors found in the system. Check the browser console for errors."
                icon="🩺"
              />
            ) : filteredDoctors.length === 0 ? (
              <EmptyState
                message={filter === 'pending' 
                  ? `No pending doctor approvals found. There are ${doctors.length} total doctor(s) in the system. Check the browser console (F12) for details.` 
                  : filter === 'approved'
                  ? "No approved doctors found."
                  : "No doctors match the current filter."}
                icon="🩺"
              />
            ) : (
              <div style={styles.doctorsGrid}>
                {filteredDoctors.map((doctor, index) => (
                  <div
                    key={doctor.doctorId || doctor.DoctorId || doctor.userId || doctor.UserId || `doctor-${index}`}
                    style={styles.doctorCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.doctorHeader}>
                      <div style={styles.avatar}>
                        {getInitials(doctor.fullName || doctor.FullName)}
                      </div>
                      <div style={styles.doctorInfo}>
                        <div style={styles.doctorName}>{doctor.fullName || doctor.FullName || 'Unknown'}</div>
                        <div style={styles.doctorSpecialty}>
                          {(doctor.hasProfile === false || doctor.HasProfile === false) 
                            ? 'Profile Not Completed' 
                            : (doctor.specialty || doctor.Specialty || 'General Practice')}
                        </div>
                      </div>
                      <span style={{
                        ...styles.statusBadge,
                        ...((doctor.isApproved || doctor.IsApproved) ? styles.statusApproved : styles.statusPending)
                      }}>
                        {(doctor.isApproved || doctor.IsApproved) ? (
                          <>
                            <CheckCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                            Approved
                          </>
                        ) : (
                          <>
                            <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
                            Pending
                          </>
                        )}
                      </span>
                    </div>

                    <div style={styles.doctorDetails}>
                      <div style={styles.detailItem}>
                        <Mail style={styles.detailIcon} />
                        {doctor.email || doctor.Email || 'N/A'}
                      </div>
                      {(doctor.phone || doctor.Phone) && (
                        <div style={styles.detailItem}>
                          <Phone style={styles.detailIcon} />
                          {doctor.phone || doctor.Phone}
                        </div>
                      )}
                      {(doctor.licenseNumber || doctor.LicenseNumber) && (
                        <div style={styles.detailItem}>
                          <Stethoscope style={styles.detailIcon} />
                          License: {doctor.licenseNumber || doctor.LicenseNumber}
                        </div>
                      )}
                      {((doctor.yearsOfExperience || doctor.YearsOfExperience) > 0) && (
                        <div style={styles.detailItem}>
                          <User style={styles.detailIcon} />
                          {doctor.yearsOfExperience || doctor.YearsOfExperience} years of experience
                        </div>
                      )}
                      {(doctor.createdAt || doctor.CreatedAt) && (
                        <div style={styles.detailItem}>
                          <Calendar style={styles.detailIcon} />
                          Registered: {formatDate(doctor.createdAt || doctor.CreatedAt)}
                        </div>
                      )}
                      {(doctor.bio || doctor.Bio) && (
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          {doctor.bio || doctor.Bio}
                        </div>
                      )}
                    </div>

                    {!(doctor.isApproved || doctor.IsApproved) && (
                      <div style={styles.actionButtons}>
                        {doctor.doctorId || doctor.DoctorId ? (
                          <>
                            <button
                              onClick={() => handleApprove(doctor)}
                              style={styles.approveButton}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                            >
                              <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                              Approve
                            </button>
                            <button
                              style={styles.rejectButton}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to reject this doctor?')) {
                                  // TODO: Implement reject functionality
                                  handleError(new Error('Not implemented'), 'Reject functionality not yet implemented');
                                }
                              }}
                            >
                              <XCircle style={{ width: '1rem', height: '1rem' }} />
                              Reject
                            </button>
                          </>
                        ) : (
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#FEF3C7', 
                            color: '#92400E', 
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                          }}>
                            Profile not completed. Doctor needs to complete their profile first.
                          </div>
                        )}
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

export default AdminDoctorsPage;
