import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import Avatar from '../../components/common/Avatar/Avatar';
import doctorService from '../../api/services/doctorService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Input from '../../components/common/Input/Input';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { sidebarOpen, toggleSidebar } = useApp();

  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    pageHeaderH1: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '2rem',
      color: '#1f2937',
    },
    searchSection: {
      marginBottom: '2rem',
    },
    doctorsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '2rem',
    },
    doctorCard: {
      padding: '1.5rem',
    },
    doctorHeader: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    doctorInfo: {
      flex: 1,
    },
    doctorInfoH3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: '0 0 0.25rem 0',
      color: '#1f2937',
    },
    specialty: {
      color: '#6b7280',
      margin: '0 0 0.5rem 0',
      fontSize: '0.875rem',
    },
    doctorBio: {
      color: '#6b7280',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    doctorDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    doctorDetailsStrong: {
      color: '#1f2937',
      marginRight: '0.5rem',
    },
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getAllDoctors(true);
        setDoctors(data);
      } catch (error) {
        console.error('Failed to load doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const layoutStyles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      backgroundColor: '#f9fafb',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
    main: {
      flex: 1,
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(100vh - 4rem)',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'margin-left 0.3s ease',
    },
  };

  if (loading) {
    return (
      <div style={layoutStyles.layout}>
        <Header />
        <div style={layoutStyles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={layoutStyles.main}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyles.layout}>
      <Header />
      <div style={layoutStyles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={layoutStyles.main}>
          <div style={styles.page}>
        <div>
          <h1 style={styles.pageHeaderH1}>Find a Doctor</h1>
        </div>
        <div style={styles.searchSection}>
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialty..."
            style={{ maxWidth: '400px' }}
          />
        </div>
        {filteredDoctors.length === 0 ? (
          <EmptyState
            title="No Doctors Found"
            message="Try adjusting your search criteria."
          />
        ) : (
          <div style={styles.doctorsGrid}>
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.doctorId} style={styles.doctorCard}>
                <div style={styles.doctorHeader}>
                  <Avatar name={doctor.fullName} size="large" />
                  <div style={styles.doctorInfo}>
                    <h3 style={styles.doctorInfoH3}>{doctor.fullName}</h3>
                    <p style={styles.specialty}>{doctor.specialty}</p>
                    {doctor.isApproved && <Badge variant="success">Verified</Badge>}
                  </div>
                </div>
                <p style={styles.doctorBio}>{doctor.bio || 'No bio available'}</p>
                <div style={styles.doctorDetails}>
                  <div><strong style={styles.doctorDetailsStrong}>Experience:</strong> {doctor.yearsOfExperience} years</div>
                  <div><strong style={styles.doctorDetailsStrong}>Fee:</strong> {formatCurrency(doctor.consultationFee || doctor.ConsultationFee || 0, 'RWF')}</div>
                  {doctor.averageRating && (
                    <div><strong style={styles.doctorDetailsStrong}>Rating:</strong> ⭐ {doctor.averageRating.toFixed(1)}</div>
                  )}
                </div>
                <Link to={`/patient/appointments/book?doctorId=${doctor.doctorId}`}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Book Appointment
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorsPage;

