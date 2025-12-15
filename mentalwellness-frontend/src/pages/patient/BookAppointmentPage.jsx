import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Clock, User, Stethoscope, CheckCircle, XCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAppointments } from '../../hooks/useAppointments';
import doctorService from '../../api/services/doctorService';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 60,
    appointmentType: 'InitialConsultation',
    reason: '',
  });
  const [errors, setErrors] = useState({});

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
      maxWidth: '1200px',
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
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
    doctorSelectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    searchWrapper: {
      position: 'relative',
      marginBottom: '1.5rem',
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
    doctorsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxHeight: '500px',
      overflowY: 'auto',
    },
    doctorCard: {
      padding: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    doctorCardSelected: {
      borderColor: '#1E40AF',
      backgroundColor: 'rgba(30, 64, 175, 0.05)',
    },
    doctorInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    doctorAvatar: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1E40AF',
      fontWeight: '600',
      flexShrink: 0,
    },
    doctorDetails: {
      flex: 1,
    },
    doctorName: {
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    doctorSpecialty: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    appointmentFormCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
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
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    input: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
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
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
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
    infoBox: {
      backgroundColor: '#EEF2FF',
      border: '1px solid #C7D2FE',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.5rem',
    },
    infoText: {
      color: '#1E40AF',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const response = await doctorService.getAllDoctors(true); // Only approved doctors
        // Axios interceptor returns response.data, so response should be the array
        const doctorsData = Array.isArray(response) ? response : (response?.data || []);
        console.log('Fetched doctors:', doctorsData.length, doctorsData);
        if (doctorsData.length > 0) {
          console.log('First doctor sample:', doctorsData[0]);
        }
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Failed to load doctors:', error);
        handleError(error, 'Failed to load doctors');
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((doc) =>
      doc.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    // Use DoctorId (the Doctor record ID), not userId
    // Handle both camelCase and PascalCase from JSON
    const doctorId = doctor.doctorId || doctor.DoctorId;
    if (!doctorId) {
      console.error('Doctor ID is missing:', doctor);
      console.error('Available doctor properties:', Object.keys(doctor));
      handleError(new Error('Invalid doctor'), 'Selected doctor is missing ID. Please refresh the page and try again.');
      return;
    }
    console.log('Selected doctor:', doctor.fullName || doctor.FullName, 'with ID:', doctorId);
    setFormData((prev) => ({ ...prev, doctorId: doctorId }));
    setErrors((prev) => ({ ...prev, doctorId: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Time is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    // Validate date is not in the past
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    console.log('Selected doctor:', selectedDoctor);
    
    // Check if doctor is selected
    if (!selectedDoctor || !formData.doctorId) {
      handleError(new Error('No doctor selected'), 'Please select a doctor before booking an appointment.');
      setErrors((prev) => ({ ...prev, doctorId: 'Please select a doctor' }));
      return;
    }
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    console.log('Validation passed, starting appointment creation...');
    setLoading(true);
    try {
      // Convert date and time to proper formats for the backend
      const appointmentDate = new Date(formData.appointmentDate);
      
      // Parse time string - HTML5 time input returns HH:MM format (24-hour)
      let timeString = formData.appointmentTime.trim();
      let hours, minutes;
      
      // Handle both "HH:MM" format and any AM/PM display format
      if (timeString.includes('AM') || timeString.includes('PM')) {
        // If somehow AM/PM got into the value, parse it
        const timeParts = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          hours = parseInt(timeParts[1]);
          minutes = parseInt(timeParts[2]);
          const period = timeParts[3].toUpperCase();
          
          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }
        } else {
          throw new Error('Invalid time format');
        }
      } else {
        // Standard HH:MM format from HTML5 time input
        const timeParts = timeString.split(':');
        if (timeParts.length < 2) {
          throw new Error('Invalid time format. Please enter a valid time.');
        }
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          throw new Error(`Invalid time: ${timeString}. Please enter a valid time between 00:00 and 23:59.`);
        }
      }
      
      const timeSpanString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      console.log('Parsed time:', { original: formData.appointmentTime, hours, minutes, timeSpanString });
      
      // Get patient user ID (backend will find Patient record from UserId)
      const patientUserId = user?.userId || user?.UserId;
      const doctorId = formData.doctorId;
      
      if (!patientUserId || !doctorId) {
        throw new Error(`Missing required IDs - Patient: ${patientUserId}, Doctor: ${doctorId}`);
      }

      // Ensure doctorId is a valid GUID string
      if (typeof doctorId !== 'string' || !doctorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('Invalid doctor ID format:', doctorId);
        throw new Error('Invalid doctor ID format. Please select a doctor again.');
      }

      const appointmentPayload = {
        patientId: patientUserId, // Backend will resolve Patient record from UserId
        doctorId: doctorId, // Must be Doctor record ID
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: timeSpanString, // Format: "HH:MM:SS" for TimeSpan
        duration: parseInt(formData.duration) || 60,
        appointmentType: formData.appointmentType || 'InitialConsultation',
        patientNotes: formData.reason || null, // Map 'reason' to 'patientNotes'
        amount: 0 // Default amount, backend will use doctor's consultation fee if 0
      };

      console.log('Creating appointment with data:', appointmentPayload);
      console.log('Patient UserId:', patientUserId);
      console.log('Doctor ID:', doctorId);
      console.log('Selected doctor object:', selectedDoctor);

      const result = await createAppointment(appointmentPayload);
      console.log('Appointment created successfully:', result);
      
      handleSuccess('Appointment requested successfully! Waiting for doctor approval.');
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 1000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('❌ Error response status:', error.response.status);
        console.error('❌ Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('❌ Full error response:', error.response);
        
        // Extract detailed error message - check multiple possible formats
        let errorMessage = 'Failed to book appointment';
        
        if (error.response.data) {
          const data = error.response.data;
          
          // Try different property names for error message
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.Message) {
            errorMessage = data.Message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.Error) {
            errorMessage = data.Error;
          } else if (data.errors) {
            // Handle model validation errors (object with field names)
            const validationErrors = Object.values(data.errors).flat();
            errorMessage = validationErrors.join('; ') || 'Validation failed';
          } else if (data.title) {
            // ASP.NET Core validation error format
            errorMessage = data.title;
            if (data.errors) {
              const validationErrors = Object.values(data.errors).flat();
              errorMessage += ': ' + validationErrors.join('; ');
            }
          }
        }
        
        // If we still have a generic message, try to extract from status text
        if (errorMessage === 'Failed to book appointment' && error.response.statusText) {
          errorMessage = `${error.response.status} ${error.response.statusText}`;
        }
        
        console.error('📋 Extracted error message:', errorMessage);
        handleError(error, errorMessage);
      } else if (error.request) {
        console.error('❌ No response received from server');
        console.error('Request details:', error.request);
        handleError(error, 'No response from server. Please check your connection and try again.');
      } else {
        console.error('❌ Error setting up request:', error);
        console.error('Error message:', error.message);
        handleError(error, error.message || 'Failed to book appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  if (doctorsLoading) {
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
              <h1 style={styles.title}>Book Appointment</h1>
              <p style={styles.subtitle}>Select a doctor and schedule your appointment</p>
            </div>

            <div style={styles.twoColumn}>
              {/* Doctor Selection */}
              <div style={styles.doctorSelectionCard}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0A1D56', marginBottom: '1rem' }}>
                  Select Doctor
                </h2>
                
                {/* Search Bar */}
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by doctor name or specialty..."
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

                {errors.doctorId && (
                  <p style={styles.errorMessage}>{errors.doctorId}</p>
                )}

                {/* Doctors List */}
                {filteredDoctors.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
                    {searchTerm ? 'No doctors found matching your search.' : 'No approved doctors available.'}
                  </p>
                ) : (
                  <div style={styles.doctorsList}>
                    {filteredDoctors.map((doctor) => {
                      const doctorId = doctor.doctorId || doctor.DoctorId;
                      const selectedDoctorId = selectedDoctor?.doctorId || selectedDoctor?.DoctorId;
                      const isSelected = selectedDoctorId === doctorId;
                      return (
                        <div
                          key={doctor.doctorId || doctor.userId}
                          onClick={() => handleDoctorSelect(doctor)}
                          style={{
                            ...styles.doctorCard,
                            ...(isSelected ? styles.doctorCardSelected : {}),
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#9CA3AF';
                              e.currentTarget.style.backgroundColor = '#F9FAFB';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={styles.doctorInfo}>
                            <div style={styles.doctorAvatar}>
                              {doctor.fullName?.charAt(0) || 'D'}
                            </div>
                            <div style={styles.doctorDetails}>
                              <div style={styles.doctorName}>
                                <Stethoscope style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
                                Dr. {doctor.fullName || 'Doctor'}
                              </div>
                              <div style={styles.doctorSpecialty}>
                                {doctor.specialty || 'General Practice'}
                              </div>
                              {doctor.yearsOfExperience && (
                                <div style={{ ...styles.doctorSpecialty, marginTop: '0.25rem' }}>
                                  {doctor.yearsOfExperience} years of experience
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF', flexShrink: 0 }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Appointment Form */}
              <div style={styles.appointmentFormCard}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0A1D56', marginBottom: '1rem' }}>
                  Appointment Details
                </h2>

                {selectedDoctor && (
                  <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                      <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                      Selected: Dr. {selectedDoctor.fullName || selectedDoctor.FullName} - {selectedDoctor.specialty || selectedDoctor.Specialty}
                    </p>
                    <p style={{ ...styles.infoText, marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      Your appointment request will be sent to the doctor for approval.
                    </p>
                  </div>
                )}
                
                {!selectedDoctor && (
                  <div style={{ ...styles.infoBox, backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}>
                    <p style={{ ...styles.infoText, color: '#92400E' }}>
                      ⚠️ Please select a doctor from the list above to book an appointment.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Calendar style={{ width: '1rem', height: '1rem' }} />
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        ...styles.input,
                        ...(errors.appointmentDate ? { borderColor: '#ef4444' } : {}),
                      }}
                      onFocus={(e) => {
                        if (!errors.appointmentDate) {
                          e.currentTarget.style.border = '2px solid #1E40AF';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.appointmentDate) {
                          e.currentTarget.style.border = '2px solid #e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      required
                      disabled={!selectedDoctor}
                    />
                    {errors.appointmentDate && (
                      <p style={styles.errorMessage}>{errors.appointmentDate}</p>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Clock style={{ width: '1rem', height: '1rem' }} />
                      Appointment Time
                    </label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      style={{
                        ...styles.input,
                        ...(errors.appointmentTime ? { borderColor: '#ef4444' } : {}),
                      }}
                      onFocus={(e) => {
                        if (!errors.appointmentTime) {
                          e.currentTarget.style.border = '2px solid #1E40AF';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.appointmentTime) {
                          e.currentTarget.style.border = '2px solid #e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      required
                      disabled={!selectedDoctor}
                    />
                    {errors.appointmentTime && (
                      <p style={styles.errorMessage}>{errors.appointmentTime}</p>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Duration (minutes)</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      style={styles.select}
                      onFocus={(e) => {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      disabled={!selectedDoctor}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Appointment Type</label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleChange}
                      style={styles.select}
                      onFocus={(e) => {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      disabled={!selectedDoctor}
                    >
                      <option value="InitialConsultation">Initial Consultation</option>
                      <option value="FollowUp">Follow Up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Routine">Routine</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Reason for Visit</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Please describe the reason for your appointment..."
                      style={{
                        ...styles.textarea,
                        ...(errors.reason ? { borderColor: '#ef4444' } : {}),
                      }}
                      onFocus={(e) => {
                        if (!errors.reason) {
                          e.currentTarget.style.border = '2px solid #1E40AF';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.reason) {
                          e.currentTarget.style.border = '2px solid #e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      required
                      disabled={!selectedDoctor}
                    />
                    {errors.reason && (
                      <p style={styles.errorMessage}>{errors.reason}</p>
                    )}
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => navigate('/patient/appointments')}
                      style={styles.cancelButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !selectedDoctor || !formData.doctorId}
                      style={{
                        ...styles.submitButton,
                        opacity: (loading || !selectedDoctor || !formData.doctorId) ? 0.5 : 1,
                        cursor: (loading || !selectedDoctor || !formData.doctorId) ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading && selectedDoctor && formData.doctorId) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(30, 64, 175, 0.3)';
                          e.currentTarget.style.backgroundColor = '#2563EB';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                        if (!loading && selectedDoctor) {
                          e.currentTarget.style.backgroundColor = '#1E40AF';
                        }
                      }}
                    >
                      {loading ? 'Booking...' : 'Request Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
