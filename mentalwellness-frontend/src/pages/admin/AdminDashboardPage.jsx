import React, { useEffect, useState } from 'react';
import { Users, User, Stethoscope, Calendar, DollarSign, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import adminService from '../../api/services/adminService';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import { handleError } from '../../utils/errorHandler';
import { formatDate } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { sidebarOpen, toggleSidebar } = useApp();

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
      marginBottom: '0.5rem',
    },
    titleAccent: {
      color: '#1E40AF',
    },
    titlePrimary: {
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
    },
    statCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      width: '4rem',
      height: '4rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statContent: {},
    statNumber: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        handleError(error, 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
            {/* Dashboard Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>
                <span style={styles.titleAccent}>Admin</span>{' '}
                <span style={styles.titlePrimary}>Dashboard</span>
              </h1>
              <p style={styles.subtitle}>System overview and statistics</p>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              {/* Total Users */}
              <Link 
                to="/admin/users"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#E9D5FF' }}>
                    <Users style={{ width: '2rem', height: '2rem', color: '#9333EA' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.TotalUsers || stats?.totalUsers || 0}</div>
                    <div style={styles.statLabel}>Total Users</div>
                  </div>
                </div>
              </Link>

              {/* Active Patients */}
              <Link 
                to="/admin/patients"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>
                    <User style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.TotalPatients || stats?.totalPatients || 0}</div>
                    <div style={styles.statLabel}>Active Patients</div>
                  </div>
                </div>
              </Link>

              {/* Active Doctors */}
              <Link 
                to="/admin/doctors"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>
                    <Stethoscope style={{ width: '2rem', height: '2rem', color: '#047857' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.TotalDoctors || stats?.totalDoctors || 0}</div>
                    <div style={styles.statLabel}>Active Doctors</div>
                  </div>
                </div>
              </Link>

              {/* Today's Appointments */}
              <Link 
                to="/admin/appointments"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#FED7AA' }}>
                    <Calendar style={{ width: '2rem', height: '2rem', color: '#EA580C' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.TodaysAppointments || stats?.todaysAppointments || stats?.UpcomingAppointments || stats?.upcomingAppointments || 0}</div>
                    <div style={styles.statLabel}>Today's Appointments</div>
                  </div>
                </div>
              </Link>

              {/* Pending Doctor Approvals */}
              <Link 
                to="/admin/doctors"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#FEE2E2' }}>
                    <AlertCircle style={{ width: '2rem', height: '2rem', color: '#DC2626' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.PendingDoctors || stats?.pendingDoctors || 0}</div>
                    <div style={styles.statLabel}>Pending Approvals</div>
                  </div>
                </div>
              </Link>

              {/* Payments Summary */}
              <Link 
                to="/admin/payments"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#DCFCE7' }}>
                    <DollarSign style={{ width: '2rem', height: '2rem', color: '#16A34A' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>${((stats?.TotalRevenue || stats?.totalRevenue || 0) / 100).toFixed(2)}</div>
                    <div style={styles.statLabel}>Total Revenue</div>
                  </div>
                </div>
              </Link>

              {/* Medical Records */}
              <Link 
                to="/admin/medical-records"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#E0E7FF' }}>
                    <FileText style={{ width: '2rem', height: '2rem', color: '#4F46E5' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.TotalMedicalRecords || stats?.totalMedicalRecords || 0}</div>
                    <div style={styles.statLabel}>Medical Records</div>
                  </div>
                </div>
              </Link>

              {/* Treatment Plans */}
              <Link 
                to="/admin/treatment-plans"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div 
                  style={styles.statCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ ...styles.statIcon, backgroundColor: '#FCE7F3' }}>
                    <CheckCircle2 style={{ width: '2rem', height: '2rem', color: '#DB2777' }} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statNumber}>{stats?.ActiveTreatmentPlans || stats?.activeTreatmentPlans || stats?.TotalTreatmentPlans || stats?.totalTreatmentPlans || 0}</div>
                    <div style={styles.statLabel}>Active Treatment Plans</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
