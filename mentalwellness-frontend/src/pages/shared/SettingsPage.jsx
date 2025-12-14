import React, { useState } from 'react';
import { Bell, Shield, Globe, Mail } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import { handleSuccess } from '../../utils/errorHandler';

const SettingsPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showEmail: false,
  });
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

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
      maxWidth: '896px',
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
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#0A1D56',
    },
    settingsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    settingItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    settingInfo: {},
    settingLabel: {
      fontWeight: '500',
      color: '#0A1D56',
      marginBottom: '0.25rem',
    },
    settingDescription: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      accentColor: '#1E40AF',
      cursor: 'pointer',
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
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
  };

  const handleSave = () => {
    handleSuccess('Settings saved successfully');
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Settings</h1>
              <p style={styles.subtitle}>Manage your account settings and preferences</p>
            </div>

            {/* Notification Settings */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Bell style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                <h2 style={styles.cardTitle}>Notification Preferences</h2>
              </div>
              <div style={styles.settingsList}>
                <label
                  style={styles.settingItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Email Notifications</div>
                    <div style={styles.settingDescription}>Receive notifications via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    style={styles.checkbox}
                  />
                </label>
                <label
                  style={styles.settingItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>SMS Notifications</div>
                    <div style={styles.settingDescription}>Receive notifications via SMS</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    style={styles.checkbox}
                  />
                </label>
                <label
                  style={styles.settingItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Push Notifications</div>
                    <div style={styles.settingDescription}>Receive push notifications in browser</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    style={styles.checkbox}
                  />
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Shield style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                <h2 style={styles.cardTitle}>Privacy Settings</h2>
              </div>
              <div style={styles.settingsList}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
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
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                <label
                  style={styles.settingItem}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={styles.settingInfo}>
                    <div style={styles.settingLabel}>Show Email</div>
                    <div style={styles.settingDescription}>Allow others to see your email address</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                    style={styles.checkbox}
                  />
                </label>
              </div>
            </div>

            {/* Language & Region */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <Globe style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
                <h2 style={styles.cardTitle}>Language & Region</h2>
              </div>
              <div style={styles.settingsList}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
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
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Time Zone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
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
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                Save Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
