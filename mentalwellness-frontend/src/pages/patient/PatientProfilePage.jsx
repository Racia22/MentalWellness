import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Key, Camera, Trash2, Check } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import userService from '../../api/services/userService';
import authService from '../../api/services/authService';
import patientService from '../../api/services/patientService';

const PatientProfilePage = () => {
  const { user, setUser } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [patientData, setPatientData] = useState({
    age: '',
    gender: '',
    dateOfBirth: '',
    category: '',
    address: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });
  const [patientRecord, setPatientRecord] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      // Load existing profile image if available
      if (user.profileImage) {
        setImagePreview(`/src/assets/images/${user.profileImage}`);
      }
      
      // Load patient data if exists
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    if (!user?.userId) return;
    
    try {
      const response = await patientService.getPatientByUserId(user.userId);
      const patient = response.data || response;
      if (patient) {
        setPatientRecord(patient);
        setPatientData({
          age: patient.age || '',
          gender: patient.gender || '',
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
          category: patient.category || '',
          address: patient.address || '',
          emergencyContact: patient.emergencyContact || '',
          emergencyContactPhone: patient.emergencyContactPhone || '',
        });
      }
    } catch (error) {
      // Patient record doesn't exist yet - that's okay, user can create it
      console.log('No patient record found, will create one on save');
      setPatientRecord(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        handleError(new Error('File too large'), 'Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveImageToAssets = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user.userId);
      
      // This would be an API call to save the image
      // For now, we'll simulate saving with a filename
      const fileName = `user${user.userId}.${file.name.split('.').pop()}`;
      return fileName;
    } catch (error) {
      throw new Error('Failed to save image');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientDataChange = (e) => {
    setPatientData({ ...patientData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageName = user.profileImage;
      
      if (profileImage) {
        imageName = await saveImageToAssets(profileImage);
      } else if (imagePreview === null) {
        imageName = null;
      }

      // Use the new profile update endpoint that's accessible to all authenticated users
      const updated = await authService.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profileImage: imageName,
      });
      
      // Store the image preview (data URL) for immediate display, or use the filename
      const profileImageUrl = imagePreview || (imageName ? `/src/assets/images/${imageName}` : null);
      
      // Map response to match frontend user object structure
      const updatedUser = {
        ...user,
        userId: updated.userId || updated.UserId || user.userId,
        email: updated.email || updated.Email || formData.email,
        fullName: updated.fullName || updated.FullName || formData.fullName,
        phone: updated.phone || updated.Phone || formData.phone,
        profileImage: profileImageUrl,
        role: updated.userRole || updated.UserRole || user.role,
        userRole: updated.userRole || updated.UserRole || user.userRole,
      };
      
      setUser(updatedUser); // This will update AuthContext and localStorage
      
      // Now handle Patient record (create or update)
      if (!patientData.age || !patientData.gender || !patientData.dateOfBirth || !patientData.category) {
        handleError(new Error('Missing required fields'), 'Please fill in all required patient information fields (Age, Gender, Date of Birth, Category)');
        setLoading(false);
        return;
      }

      const patientPayload = {
        userId: user.userId,
        age: parseInt(patientData.age),
        gender: patientData.gender,
        dateOfBirth: patientData.dateOfBirth,
        category: patientData.category,
        address: patientData.address || null,
        emergencyContact: patientData.emergencyContact || null,
        emergencyContactPhone: patientData.emergencyContactPhone || null,
      };
      
      if (patientRecord?.patientId || patientRecord?.PatientId) {
        // Update existing patient record (don't send userId for updates)
        const patientId = patientRecord.patientId || patientRecord.PatientId;
        const updatePayload = {
          age: patientPayload.age,
          gender: patientPayload.gender,
          dateOfBirth: patientPayload.dateOfBirth,
          category: patientPayload.category,
          address: patientPayload.address,
          emergencyContact: patientPayload.emergencyContact,
          emergencyContactPhone: patientPayload.emergencyContactPhone,
        };
        await patientService.updatePatient(patientId, updatePayload);
        // Reload patient data
        await loadPatientData();
      } else {
        // Create new patient record
        await patientService.createPatient(patientPayload);
        // Reload patient data
        await loadPatientData();
      }
      
      handleSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      handleError(error, 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      handleError(new Error('Passwords do not match'), 'Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      handleError(new Error('Password too short'), 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      handleSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      handleError(error, 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Show loading if user data is not available yet
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-in { animation: slideIn 0.4s ease-out; }
        .profile-card { transition: all 0.3s ease; }
        .profile-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); }
        .input-field { transition: all 0.3s ease; }
        .input-field:focus { border-color: #1E40AF !important; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1) !important; outline: none; }
        .btn-hover { transition: all 0.3s ease; }
        .btn-hover:hover { transform: scale(1.05); }
        .image-upload-area { position: relative; transition: all 0.3s ease; }
        .image-upload-area:hover { transform: scale(1.02); }
      `}</style>
      
      <Header />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="animate-fade-in">
            {/* Header Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-block', background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                👤 Profile Settings
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 700, color: '#0A1D56', marginBottom: '0.5rem' }}>
                My Profile
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>
                Manage your personal information and account settings
              </p>
            </div>

            {/* Profile Information Card */}
            <div className="profile-card" style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem', marginBottom: '1.5rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(30, 64, 175, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  {/* Profile Image */}
                  <div style={{ position: 'relative' }}>
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #1E40AF', boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)' }}
                      />
                    ) : (
                      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: 'white', boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)' }}>
                        {getInitials(user?.fullName || user?.email)}
                      </div>
                    )}
                    {isEditing && (
                      <div style={{ position: 'absolute', bottom: 0, right: 0, display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1E40AF', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.4)' }}
                          className="btn-hover"
                        >
                          <Camera style={{ width: '20px', height: '20px' }} />
                        </button>
                        {imagePreview && (
                          <button
                            onClick={handleRemoveImage}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
                            className="btn-hover"
                          >
                            <Trash2 style={{ width: '20px', height: '20px' }} />
                          </button>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0A1D56', marginBottom: '0.5rem' }}>
                      {user?.fullName || 'User'}
                    </h2>
                    <p style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                      <Mail style={{ width: '1.25rem', height: '1.25rem' }} />
                      {user?.email}
                    </p>
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', color: '#047857', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600 }}>
                        ✓ {user?.role || user?.userRole || 'Patient'}
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)' }}
                    className="btn-hover"
                  >
                    <Edit2 style={{ width: '1.25rem', height: '1.25rem' }} />
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="animate-slide-in">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                        <User style={{ width: '1rem', height: '1rem' }} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="input-field"
                        style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                        <Mail style={{ width: '1rem', height: '1rem' }} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                        <Phone style={{ width: '1rem', height: '1rem' }} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                  </div>

                  {/* Patient-Specific Fields */}
                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A1D56', marginBottom: '1.5rem' }}>Patient Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={patientData.age}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          min="0"
                          max="120"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={patientData.gender}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={patientData.dateOfBirth}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Category *
                        </label>
                        <select
                          name="category"
                          value={patientData.category}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Individual">Individual</option>
                          <option value="Couple">Couple</option>
                          <option value="Teenager">Teenager</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={patientData.address}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          placeholder="Enter your address"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={patientData.emergencyContact}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          Emergency Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={patientData.emergencyContactPhone}
                          onChange={handlePatientDataChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          placeholder="+250 7XX XXX XXX"
                        />
                      </div>
                    </div>
                    {!patientRecord && (
                      <div style={{ padding: '1rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>
                          ⚠️ Please complete your patient profile to book appointments. All fields marked with * are required.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setImagePreview(user?.profileImage ? `/src/assets/images/${user.profileImage}` : null);
                        setProfileImage(null);
                        // Reset patient data if exists
                        if (patientRecord) {
                          setPatientData({
                            age: patientRecord.age || '',
                            gender: patientRecord.gender || '',
                            dateOfBirth: patientRecord.dateOfBirth ? new Date(patientRecord.dateOfBirth).toISOString().split('T')[0] : '',
                            category: patientRecord.category || '',
                            address: patientRecord.address || '',
                            emergencyContact: patientRecord.emergencyContact || '',
                            emergencyContactPhone: patientRecord.emergencyContactPhone || '',
                          });
                        }
                      }}
                      style={{ padding: '0.875rem 1.75rem', border: '2px solid #d1d5db', color: '#374151', borderRadius: '0.75rem', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      className="btn-hover"
                    >
                      <X style={{ width: '1.25rem', height: '1.25rem' }} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ padding: '0.875rem 1.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)' }}
                      className={loading ? '' : 'btn-hover'}
                    >
                      <Save style={{ width: '1.25rem', height: '1.25rem' }} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[
                      { label: 'Full Name', value: user?.fullName || 'Not provided', icon: <User style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                      { label: 'Email', value: user?.email || 'Not provided', icon: <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                      { label: 'Phone', value: user?.phone || 'Not provided', icon: <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                    ].map((item, idx) => (
                      <div key={idx} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          {item.icon}
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>{item.label}</span>
                        </div>
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0A1D56', marginTop: '0.5rem' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Patient Information Display */}
                  {patientRecord ? (
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A1D56', marginBottom: '1.5rem' }}>Patient Information</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {[
                          { label: 'Age', value: patientRecord.age || 'Not provided' },
                          { label: 'Gender', value: patientRecord.gender || 'Not provided' },
                          { label: 'Date of Birth', value: patientRecord.dateOfBirth ? new Date(patientRecord.dateOfBirth).toLocaleDateString() : 'Not provided' },
                          { label: 'Category', value: patientRecord.category || 'Not provided' },
                          { label: 'Address', value: patientRecord.address || 'Not provided' },
                          { label: 'Emergency Contact', value: patientRecord.emergencyContact || 'Not provided' },
                          { label: 'Emergency Contact Phone', value: patientRecord.emergencyContactPhone || 'Not provided' },
                        ].map((item, idx) => (
                          <div key={idx} style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>{item.label}</span>
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0A1D56', marginTop: '0.5rem' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>
                        ⚠️ <strong>Complete Your Patient Profile:</strong> Please edit your profile and fill in your patient information (Age, Gender, Date of Birth, Category) to book appointments.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Security Section */}
            <div className="profile-card" style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(30, 64, 175, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isChangingPassword ? '2rem' : '0', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0A1D56', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key style={{ width: '1.5rem', height: '1.5rem', color: '#D97706' }} />
                    </div>
                    Security Settings
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', marginLeft: '60px' }}>
                    Keep your account secure with a strong password
                  </p>
                </div>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    style={{ padding: '0.875rem 1.75rem', color: '#1E40AF', background: 'rgba(30, 64, 175, 0.1)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                    className="btn-hover"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordSubmit} className="animate-slide-in">
                  <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {[
                      { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter your current password' },
                      { name: 'newPassword', label: 'New Password', placeholder: 'Enter new password (min 8 characters)' },
                      { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm your new password' },
                    ].map((field, idx) => (
                      <div key={idx}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem', display: 'block' }}>
                          {field.label}
                        </label>
                        <input
                          type="password"
                          name={field.name}
                          value={passwordData[field.name]}
                          onChange={handlePasswordChange}
                          placeholder={field.placeholder}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #FCD34D' }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check style={{ width: '1rem', height: '1rem' }} />
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      style={{ padding: '0.875rem 1.75rem', border: '2px solid #d1d5db', color: '#374151', borderRadius: '0.75rem', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
                      className="btn-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ padding: '0.875rem 1.75rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)' }}
                      className={loading ? '' : 'btn-hover'}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default PatientProfilePage;