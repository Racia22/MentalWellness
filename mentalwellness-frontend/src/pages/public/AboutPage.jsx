import React from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Card from '../../components/common/Card/Card';

const AboutPage = () => {
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
    aboutContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    aboutSection: {
      padding: '1.5rem',
    },
    sectionH2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#1f2937',
    },
    sectionP: {
      color: '#6b7280',
      lineHeight: 1.6,
    },
    sectionUl: {
      listStyle: 'none',
      padding: 0,
    },
    sectionLi: {
      padding: '0.5rem 0',
      color: '#6b7280',
      paddingLeft: '1.5rem',
      position: 'relative',
    },
    sectionLiBefore: {
      content: '"✓"',
      position: 'absolute',
      left: 0,
      color: '#10b981',
      fontWeight: 'bold',
    },
  };

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
          <h1 style={styles.pageTitle}>About Mental Wellness</h1>
          <div style={styles.aboutContent}>
            <Card style={styles.aboutSection}>
              <h2 style={styles.sectionH2}>Our Mission</h2>
              <p style={styles.sectionP}>
                To provide accessible, professional mental health care services to individuals 
                seeking support and guidance on their wellness journey.
              </p>
            </Card>
            <Card style={styles.aboutSection}>
              <h2 style={styles.sectionH2}>Our Vision</h2>
              <p style={styles.sectionP}>
                To be the leading platform for mental health care, connecting patients with 
                qualified professionals and supporting their journey to better mental wellness.
              </p>
            </Card>
            <Card style={styles.aboutSection}>
              <h2 style={styles.sectionH2}>What We Offer</h2>
              <ul style={styles.sectionUl}>
                {['Access to licensed mental health professionals', 'Easy appointment booking and management', 'Secure messaging with your healthcare provider', 'Progress tracking and mood monitoring tools', 'Personalized treatment plans'].map((item, idx) => (
                  <li key={idx} style={styles.sectionLi}>
                    <span style={{position: 'absolute', left: 0, color: '#10b981', fontWeight: 'bold'}}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;

