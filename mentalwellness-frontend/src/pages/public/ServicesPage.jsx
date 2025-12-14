import React from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Card from '../../components/common/Card/Card';

const ServicesPage = () => {
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
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    serviceCard: {
      textAlign: 'center',
      padding: '2rem',
      transition: 'transform 0.2s',
      cursor: 'pointer',
    },
    serviceIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    serviceTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: '#1f2937',
    },
    serviceDescription: {
      color: '#6b7280',
      lineHeight: 1.6,
      margin: 0,
    },
  };

  const services = [
    {
      icon: '💬',
      title: 'Online Consultations',
      description: 'Connect with licensed therapists via secure video or chat sessions.',
    },
    {
      icon: '📅',
      title: 'Appointment Scheduling',
      description: 'Easily book and manage your appointments with our intuitive scheduling system.',
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your mental health journey with detailed analytics and reports.',
    },
    {
      icon: '💊',
      title: 'Treatment Plans',
      description: 'Receive personalized treatment plans tailored to your needs.',
    },
    {
      icon: '😊',
      title: 'Mood Tracking',
      description: 'Track your daily moods and emotional well-being over time.',
    },
    {
      icon: '🔒',
      title: 'Secure Messaging',
      description: 'Communicate securely with your healthcare provider through encrypted messages.',
    },
  ];

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
          <h1 style={styles.pageTitle}>Our Services</h1>
          <div style={styles.servicesGrid}>
            {services.map((service, index) => (
              <Card 
                key={index} 
                style={styles.serviceCard}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.serviceIcon}>{service.icon}</div>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDescription}>{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;

