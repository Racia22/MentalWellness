import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, User, Calendar, FileText, Pill, 
  MessageSquare, CreditCard, Settings, LogOut, Activity,
  Stethoscope, ClipboardList, Heart
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inline styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 40,
      display: isDesktop ? 'none' : (isOpen ? 'block' : 'none'),
    },
    sidebar: {
      position: isDesktop ? 'relative' : 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '16rem',
      backgroundColor: '#0A1D56',
      zIndex: 50,
      transform: isDesktop ? 'translateX(0)' : (isOpen ? 'translateX(0)' : 'translateX(-100%)'),
      transition: 'transform 0.3s ease-in-out',
      boxShadow: isDesktop ? 'none' : (isOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'),
      display: 'flex',
      flexDirection: 'column',
    },
    logoSection: {
      padding: '1.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
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
      color: '#FFFFFF',
    },
    nav: {
      flex: 1,
      padding: '1rem',
      overflowY: 'auto',
    },
    navList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      textDecoration: 'none',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    navItemActive: {
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    navItemHover: {
      backgroundColor: 'rgba(30, 64, 175, 0.2)',
      color: '#FFFFFF',
    },
    navIcon: {
      width: '1.25rem',
      height: '1.25rem',
    },
    navLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    logoutSection: {
      padding: '1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
  };

  const getMenuItems = () => {
    if (!user) return [];

    const role = user.role || user.userRole;

    if (role === 'Admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/patients', label: 'Patients', icon: User },
        { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
        { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
        { path: '/admin/medical-records', label: 'Medical Records', icon: ClipboardList },
        { path: '/admin/treatment-plans', label: 'Treatment Plans', icon: Pill },
        { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
        { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'Doctor') {
      return [
        { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/doctor/patients', label: 'Patients', icon: User },
        { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
        { path: '/doctor/medical-records', label: 'Medical Records', icon: ClipboardList },
        { path: '/doctor/treatment-plans', label: 'Treatment Plans', icon: Pill },
        { path: '/doctor/messages', label: 'Messages', icon: MessageSquare },
        { path: '/doctor/profile', label: 'Profile', icon: User },
        { path: '/doctor/settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'Patient') {
      return [
        { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/patient/appointments', label: 'Appointments', icon: Calendar },
        { path: '/patient/doctors', label: 'Doctors', icon: Stethoscope },
        { path: '/patient/medical-records', label: 'Medical Records', icon: ClipboardList },
        { path: '/patient/treatment-plans', label: 'Treatment Plans', icon: Pill },
        { path: '/patient/mood-tracking', label: 'Mood Tracking', icon: Activity },
        { path: '/patient/messages', label: 'Messages', icon: MessageSquare },
        { path: '/patient/payments', label: 'Payments', icon: CreditCard },
        { path: '/patient/profile', label: 'Profile', icon: User },
        { path: '/patient/settings', label: 'Settings', icon: Settings },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      {!isDesktop && isOpen && (
        <div 
          style={styles.overlay}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <Link to="/" style={styles.logoLink}>
            <Heart style={{ width: '2rem', height: '2rem', color: '#1E40AF' }} />
            <span style={styles.logoText}>Mental Wellness</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor;
                      e.currentTarget.style.color = styles.navItemHover.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = styles.navItem.color;
                    }
                  }}
                >
                  <Icon style={styles.navIcon} />
                  <span style={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div style={styles.logoutSection}>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = styles.logoutButton.color;
            }}
          >
            <LogOut style={styles.navIcon} />
            <span style={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
