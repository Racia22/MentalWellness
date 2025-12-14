import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotificationContext } from '../../../contexts/NotificationContext';
import Avatar from '../../common/Avatar/Avatar';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  let unreadCount = 0;
  try {
    const notificationContext = useNotificationContext();
    unreadCount = notificationContext?.unreadCount || 0;
  } catch (error) {
    // Context not available on public pages
  }
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Inline styles
  const styles = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e7eb',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '4rem',
    },
    logoLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1E40AF',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    notificationLink: {
      position: 'relative',
      padding: '0.5rem',
      color: '#6B7280',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '1.25rem',
      height: '1.25rem',
      backgroundColor: '#ef4444',
      color: '#FFFFFF',
      fontSize: '0.75rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userMenu: {
      position: 'relative',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    },
    userName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#6B7280',
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      marginTop: '0.5rem',
      width: '12rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      zIndex: 50,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      color: '#6B7280',
      textDecoration: 'none',
      transition: 'background-color 0.2s',
    },
    divider: {
      borderTop: '1px solid #e5e7eb',
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
    },
    loginLink: {
      color: '#6B7280',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s',
    },
    signUpButton: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
      textDecoration: 'none',
    },
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    const role = user.role || user.userRole;
    switch (role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Doctor':
        return '/doctor/dashboard';
      case 'Patient':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.content}>
          <Link to={isAuthenticated ? getDashboardPath() : '/'} style={styles.logoLink}>
            <span style={styles.logoText}>Mental Wellness</span>
          </Link>

          {isAuthenticated ? (
            <nav style={styles.nav}>
              <Link 
                to="/notifications" 
                style={styles.notificationLink}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1E40AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
                {unreadCount > 0 && (
                  <span style={styles.badge}>{unreadCount}</span>
                )}
              </Link>
              <div 
                style={styles.userMenu}
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
              >
                <div style={styles.userInfo}>
                  <Avatar 
                    name={user?.fullName || user?.email} 
                    src={user?.profileImage || null}
                    size="small" 
                  />
                  <span style={{ ...styles.userName, display: window.innerWidth >= 768 ? 'block' : 'none' }}>
                    {user?.fullName || user?.email}
                  </span>
                </div>
                {showMenu && (
                  <div style={styles.dropdown}>
                    <Link 
                      to={
                        user?.userRole === 'Admin' ? '/admin/profile' :
                        user?.userRole === 'Doctor' ? '/doctor/profile' :
                        user?.userRole === 'Patient' ? '/patient/profile' :
                        '/profile'
                      }
                      style={styles.dropdownItem}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User style={{ width: '1rem', height: '1rem' }} />
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      style={styles.dropdownItem}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings style={{ width: '1rem', height: '1rem' }} />
                      Settings
                    </Link>
                    <div style={styles.divider}></div>
                    <button 
                      onClick={handleLogout}
                      style={{
                        ...styles.dropdownItem,
                        width: '100%',
                        textAlign: 'left',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut style={{ width: '1rem', height: '1rem' }} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            <nav style={styles.nav}>
              <Link 
                to="/login" 
                style={styles.loginLink}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1E40AF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Login
              </Link>
              <Link 
                to="/register"
                style={styles.signUpButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                Sign Up
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
