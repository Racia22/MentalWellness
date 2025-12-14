import React from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import { Link } from 'react-router-dom';
import doctorService from '../../api/services/doctorService';
import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import Avatar from '../../components/common/Avatar/Avatar';
import Badge from '../../components/common/Badge/Badge';
import { formatCurrency } from '../../utils/formatters';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = {
    page: {
      padding: '4rem 2rem',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(100vh - 200px)',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    pageTitle: {
      fontSize: '3rem',
      fontWeight: 700,
      textAlign: 'center',
      marginBottom: '3rem',
      color: '#1f2937',
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
    doctorName: {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: '0 0 0.25rem 0',
      color: '#1f2937',
    },
    doctorSpecialty: {
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
    },
    detailItem: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    detailItemStrong: {
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}>
        <Header />
        <LoadingScreen />
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      <Header />
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Our Doctors</h1>
          <div style={styles.doctorsGrid}>
            {doctors.map((doctor) => (
              <Card key={doctor.doctorId} style={styles.doctorCard}>
                <div style={styles.doctorHeader}>
                  <Avatar name={doctor.fullName} size="large" />
                  <div style={styles.doctorInfo}>
                    <h3 style={styles.doctorName}>{doctor.fullName}</h3>
                    <p style={styles.doctorSpecialty}>{doctor.specialty}</p>
                    {doctor.isApproved && (
                      <Badge variant="success" size="small">Verified</Badge>
                    )}
                  </div>
                </div>
                <p style={styles.doctorBio}>{doctor.bio || 'No bio available'}</p>
                <div style={styles.doctorDetails}>
                  <div style={styles.detailItem}>
                    <strong style={styles.detailItemStrong}>Experience:</strong> {doctor.yearsOfExperience} years
                  </div>
                  <div style={styles.detailItem}>
                    <strong style={styles.detailItemStrong}>Fee:</strong> {formatCurrency(doctor.consultationFee)}
                  </div>
                  {doctor.averageRating && (
                    <div style={styles.detailItem}>
                      <strong style={styles.detailItemStrong}>Rating:</strong> ⭐ {doctor.averageRating.toFixed(1)} ({doctor.totalReviews} reviews)
                    </div>
                  )}
                </div>
                <Link to="/register">
                  <Button variant="primary" style={{ width: '100%' }}>
                    Book Appointment
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorsPage;

