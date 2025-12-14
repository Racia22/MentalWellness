import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Clock, Edit2, Lock, Save, X } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import axiosInstance from '../../api/axios.config';
import toast from 'react-hot-toast';

const AdminProfilePage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        fullName: user.fullName || user.FullName || '',
        email: user.email || user.Email || '',
        phone: user.phone || user.Phone || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      fullName: profile?.fullName || profile?.FullName || '',
      email: profile?.email || profile?.Email || '',
      phone: profile?.phone || profile?.Phone || '',
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || user?.UserId;
      const response = await axiosInstance.put(`/api/users/${userId}`, formData);
      setProfile(response.data || response);
      setEditing(false);
      handleSuccess('Profile updated successfully');
      // Update user in localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      handleError(error, 'Failed to update profile');
    } finally {
      setLoading(false);
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
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
    },
    profileCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '2px solid #f3f4f6',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      backgroundColor: '#1E40AF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: '3rem',
      fontWeight: 'bold',
      flexShrink: 0,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    profileRole: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    infoSection: {
      marginBottom: '1.5rem',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
      marginBottom: '0.75rem',
    },
    infoIcon: {
      width: '1.25rem',
      height: '1.25rem',
      color: '#1E40AF',
      flexShrink: 0,
    },
    infoLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      minWidth: '120px',
    },
    infoValue: {
      fontSize: '1rem',
      color: '#0A1D56',
      fontWeight: '500',
      flex: 1,
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '2px solid #f3f4f6',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },
    buttonPrimary: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
    },
    buttonSecondary: {
      backgroundColor: '#6B7280',
      color: '#FFFFFF',
    },
    buttonDanger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
    },
  };

  if (!profile) {
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

  const initials = (profile.fullName || profile.FullName || 'A')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Admin Profile</h1>
              <p style={styles.subtitle}>Manage your account information and settings</p>
            </div>

            <div style={styles.profileCard}>
              <div style={styles.profileHeader}>
                <div style={styles.avatar}>
                  {profile.profileImage || profile.ProfileImage ? (
                    <img
                      src={profile.profileImage || profile.ProfileImage}
                      alt={profile.fullName || profile.FullName}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div style={styles.profileInfo}>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      style={styles.input}
                      placeholder="Full Name"
                    />
                  ) : (
                    <h2 style={styles.profileName}>{profile.fullName || profile.FullName}</h2>
                  )}
                  <span style={styles.profileRole}>Administrator</span>
                </div>
              </div>

              <div style={styles.infoSection}>
                <div style={styles.infoItem}>
                  <Mail style={styles.infoIcon} />
                  <span style={styles.infoLabel}>Email:</span>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={styles.input}
                      placeholder="Email"
                    />
                  ) : (
                    <span style={styles.infoValue}>{profile.email || profile.Email}</span>
                  )}
                </div>

                <div style={styles.infoItem}>
                  <Phone style={styles.infoIcon} />
                  <span style={styles.infoLabel}>Phone:</span>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={styles.input}
                      placeholder="Phone"
                    />
                  ) : (
                    <span style={styles.infoValue}>{profile.phone || profile.Phone || 'N/A'}</span>
                  )}
                </div>

                <div style={styles.infoItem}>
                  <Calendar style={styles.infoIcon} />
                  <span style={styles.infoLabel}>Account Created:</span>
                  <span style={styles.infoValue}>
                    {formatDate(profile.createdAt || profile.CreatedAt)}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <Clock style={styles.infoIcon} />
                  <span style={styles.infoLabel}>Last Login:</span>
                  <span style={styles.infoValue}>
                    {profile.lastLoginAt || profile.LastLoginAt
                      ? formatDate(profile.lastLoginAt || profile.LastLoginAt)
                      : 'Never'}
                  </span>
                </div>
              </div>

              <div style={styles.actions}>
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      style={{ ...styles.button, ...styles.buttonPrimary }}
                    >
                      <Save style={{ width: '1rem', height: '1rem' }} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      style={{ ...styles.button, ...styles.buttonSecondary }}
                    >
                      <X style={{ width: '1rem', height: '1rem' }} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      style={{ ...styles.button, ...styles.buttonPrimary }}
                    >
                      <Edit2 style={{ width: '1rem', height: '1rem' }} />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => toast.info('Change password feature coming soon!')}
                      style={{ ...styles.button, ...styles.buttonSecondary }}
                    >
                      <Lock style={{ width: '1rem', height: '1rem' }} />
                      Change Password
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfilePage;

