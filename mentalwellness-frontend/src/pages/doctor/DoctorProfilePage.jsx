import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Key, Camera, Trash2, Check, Stethoscope, Award, DollarSign, FileText, Clock } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import userService from '../../api/services/userService';
import authService from '../../api/services/authService';
import doctorService from '../../api/services/doctorService';

const DoctorProfilePage = () => {
  const { user, setUser } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });

  const [doctorFormData, setDoctorFormData] = useState({
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    bio: '',
    consultationFee: 0,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      loadUserAndDoctorData();
    }
  }, [user]);

  const loadUserAndDoctorData = async () => {
    try {
      setLoading(true);
      // Load user data
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
      });

      if (user.profileImage) {
        setImagePreview(typeof user.profileImage === 'string' && user.profileImage.startsWith('data:') 
          ? user.profileImage 
          : `/src/assets/images/${user.profileImage}`);
      }

      // Try to get doctor data
      try {
        // Get all doctors and find the one matching this user
        const response = await doctorService.getAllDoctors();
        const allDoctors = Array.isArray(response) ? response : (response?.data || []);
        const doctor = allDoctors.find(d => {
          const doctorUserId = d.userId || d.UserId;
          const currentUserId = user.userId || user.UserId;
          return doctorUserId === currentUserId;
        });
        
        if (doctor) {
          console.log('Found doctor record:', doctor);
          setDoctorData(doctor);
          setDoctorFormData({
            specialty: doctor.specialty || doctor.Specialty || '',
            licenseNumber: doctor.licenseNumber || doctor.LicenseNumber || '',
            yearsOfExperience: doctor.yearsOfExperience || doctor.YearsOfExperience || 0,
            bio: doctor.bio || doctor.Bio || '',
            consultationFee: doctor.consultationFee || doctor.ConsultationFee || 0,
          });
        } else {
          console.log('No doctor record found for user, profile needs to be completed');
          setDoctorData(null);
        }
      } catch (error) {
        console.error('Error loading doctor data:', error);
        console.log('No doctor record found, will create on save');
        setDoctorData(null);
      }
    } catch (error) {
      handleError(error, 'Failed to load profile data');
    } finally {
      setLoading(false);
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
      const fileName = `user${user.userId}.${file.name.split('.').pop()}`;
      return fileName;
    } catch (error) {
      throw new Error('Failed to save image');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctorFormData({ 
      ...doctorFormData, 
      [name]: name === 'yearsOfExperience' || name === 'consultationFee' ? parseFloat(value) || 0 : value 
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required doctor fields
    if (!doctorFormData.specialty || !doctorFormData.licenseNumber) {
      handleError(new Error('Missing required fields'), 'Please fill in Specialty and License Number');
      return;
    }

    setLoading(true);
    try {
      let imageName = user.profileImage;
      
      if (profileImage) {
        imageName = await saveImageToAssets(profileImage);
      } else if (imagePreview === null) {
        imageName = null;
      }

      // Update user data first
      try {
        const updated = await userService.updateUser(user?.userId || user?.UserId, {
          ...formData,
          profileImage: imageName,
        });
        const updatedUserData = updated?.data || updated || {};
        const profileImageUrl = imagePreview || (imageName ? `/src/assets/images/${imageName}` : null);
        const updatedUser = { ...user, ...updatedUserData, profileImage: profileImageUrl };
        setUser(updatedUser);
      } catch (userError) {
        console.warn('Failed to update user data:', userError);
        // Continue with doctor profile creation/update even if user update fails
      }

      // Create or update doctor record
      const doctorId = doctorData?.doctorId || doctorData?.DoctorId;
      const userId = user.userId || user.UserId;
      
      if (!userId) {
        throw new Error('User ID is missing. Please log out and log back in.');
      }

      if (doctorId) {
        // Update existing doctor
        console.log('Updating doctor with ID:', doctorId);
        console.log('Update data:', {
          specialty: doctorFormData.specialty,
          licenseNumber: doctorFormData.licenseNumber,
          yearsOfExperience: parseInt(doctorFormData.yearsOfExperience) || 0,
          bio: doctorFormData.bio || null,
          consultationFee: parseFloat(doctorFormData.consultationFee) || 0,
        });
        
        const updateResponse = await doctorService.updateDoctor(doctorId, {
          specialty: doctorFormData.specialty,
          licenseNumber: doctorFormData.licenseNumber,
          yearsOfExperience: parseInt(doctorFormData.yearsOfExperience) || 0,
          bio: doctorFormData.bio || null,
          consultationFee: parseFloat(doctorFormData.consultationFee) || 0,
        });
        
        console.log('Update response:', updateResponse);
        handleSuccess('Profile updated successfully');
      } else {
        // Create new doctor record
        console.log('Creating new doctor profile for user:', userId);
        const createData = {
          userId: userId,
          specialty: doctorFormData.specialty.trim(),
          licenseNumber: doctorFormData.licenseNumber.trim(),
          yearsOfExperience: parseInt(doctorFormData.yearsOfExperience) || 0,
          bio: doctorFormData.bio?.trim() || null,
          consultationFee: parseFloat(doctorFormData.consultationFee) || 0,
        };
        console.log('Create data:', createData);
        
        const createResponse = await doctorService.createDoctor(createData);
        console.log('Create response:', createResponse);
        handleSuccess('Doctor profile created successfully! Your profile will be reviewed by an admin.');
      }

      // Reload doctor data to reflect changes
      await loadUserAndDoctorData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving doctor profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save profile';
      handleError(error, errorMessage);
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
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div>Loading...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #F5F5F0 0%, #EEEEE8 100%)' }}>
        <Header />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            <div>No user data available</div>
          </main>
        </div>
      </div>
    );
  }

  const hasDoctorProfile = !!doctorData;

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
                {hasDoctorProfile 
                  ? 'Manage your personal information and professional details'
                  : 'Complete your doctor profile to start receiving appointments'}
              </p>
              {!hasDoctorProfile && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '0.75rem', color: '#92400E' }}>
                  ⚠️ <strong>Profile Incomplete:</strong> Please complete your doctor profile below. Your profile must be approved by an admin before you can receive appointments.
                </div>
              )}
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
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', color: '#047857', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600 }}>
                        ✓ {user?.role || user?.userRole || 'Doctor'}
                      </span>
                      {doctorData && (doctorData.isApproved || doctorData.IsApproved) && (
                        <span style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', color: '#1E40AF', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600 }}>
                          ✓ Approved
                        </span>
                      )}
                      {doctorData && !(doctorData.isApproved || doctorData.IsApproved) && (
                        <span style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#92400E', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600 }}>
                          ⏳ Pending Approval
                        </span>
                      )}
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
                    {hasDoctorProfile ? 'Edit Profile' : 'Complete Profile'}
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="animate-slide-in">
                  {/* Personal Information */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0A1D56', marginBottom: '1rem' }}>Personal Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          <User style={{ width: '1rem', height: '1rem' }} />
                          Full Name *
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
                          Email Address *
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
                  </div>

                  {/* Professional Information */}
                  <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0A1D56', marginBottom: '1rem' }}>Professional Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          <Stethoscope style={{ width: '1rem', height: '1rem' }} />
                          Specialty *
                        </label>
                        <input
                          type="text"
                          name="specialty"
                          value={doctorFormData.specialty}
                          onChange={handleDoctorChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          placeholder="e.g., Psychiatry, Psychology, Mental Health Counseling"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          <FileText style={{ width: '1rem', height: '1rem' }} />
                          License Number *
                        </label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={doctorFormData.licenseNumber}
                          onChange={handleDoctorChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          placeholder="Enter your medical license number"
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          <Clock style={{ width: '1rem', height: '1rem' }} />
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={doctorFormData.yearsOfExperience}
                          onChange={handleDoctorChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                          <DollarSign style={{ width: '1rem', height: '1rem' }} />
                          Consultation Fee (RWF)
                        </label>
                        <input
                          type="number"
                          name="consultationFee"
                          value={doctorFormData.consultationFee}
                          onChange={handleDoctorChange}
                          className="input-field"
                          style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box' }}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0A1D56', marginBottom: '0.5rem' }}>
                        <FileText style={{ width: '1rem', height: '1rem' }} />
                        Bio / Professional Summary
                      </label>
                      <textarea
                        name="bio"
                        value={doctorFormData.bio}
                        onChange={handleDoctorChange}
                        className="input-field"
                        style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '1rem', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical' }}
                        placeholder="Tell patients about your background, expertise, and approach..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setImagePreview(user?.profileImage ? (typeof user.profileImage === 'string' && user.profileImage.startsWith('data:') ? user.profileImage : `/src/assets/images/${user.profileImage}`) : null);
                        setProfileImage(null);
                        loadUserAndDoctorData();
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
                      {loading ? 'Saving...' : hasDoctorProfile ? 'Save Changes' : 'Complete Profile'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {/* Personal Information Display */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0A1D56', marginBottom: '1rem' }}>Personal Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
                  </div>

                  {/* Professional Information Display */}
                  {hasDoctorProfile ? (
                    <div style={{ paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0A1D56', marginBottom: '1rem' }}>Professional Information</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {[
                          { label: 'Specialty', value: doctorFormData.specialty || 'Not provided', icon: <Stethoscope style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                          { label: 'License Number', value: doctorFormData.licenseNumber || 'Not provided', icon: <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                          { label: 'Years of Experience', value: `${doctorFormData.yearsOfExperience || 0} years`, icon: <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
                          { label: 'Consultation Fee', value: `RWF ${(doctorFormData.consultationFee || 0).toLocaleString()}`, icon: <DollarSign style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} /> },
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
                      {doctorFormData.bio && (
                        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#1E40AF' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280' }}>Bio / Professional Summary</span>
                          </div>
                          <p style={{ fontSize: '1rem', color: '#374151', marginTop: '0.5rem', lineHeight: '1.6' }}>{doctorFormData.bio}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
                      <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', borderRadius: '1rem', border: '2px solid #FCD34D', textAlign: 'center' }}>
                        <Stethoscope style={{ width: '3rem', height: '3rem', color: '#D97706', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400E', marginBottom: '0.5rem' }}>Complete Your Professional Profile</h3>
                        <p style={{ fontSize: '1rem', color: '#78350F', marginBottom: '1.5rem' }}>
                          To start receiving appointments from patients, you need to complete your professional profile with your specialty, license number, and other details.
                        </p>
                        <button
                          onClick={() => setIsEditing(true)}
                          style={{ padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', color: 'white', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)' }}
                          className="btn-hover"
                        >
                          <Edit2 style={{ width: '1.25rem', height: '1.25rem' }} />
                          Complete Profile Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

export default DoctorProfilePage;
