import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

const Footer = () => {
  // Inline styles
  const styles = {
    footer: {
      backgroundColor: '#0A1D56',
      color: '#FFFFFF',
      width: '100%',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      paddingTop: '3rem',
      paddingBottom: '3rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    section: {},
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    logoText: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1E40AF',
    },
    description: {
      color: '#D1D5DB',
      fontSize: '0.875rem',
    },
    heading: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    linksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    link: {
      color: '#D1D5DB',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s',
    },
    divider: {
      borderTop: '1px solid #374151',
      paddingTop: '2rem',
      textAlign: 'center',
    },
    copyright: {
      color: '#D1D5DB',
      fontSize: '0.875rem',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.section}>
            <div style={styles.logoSection}>
              <Brain style={{ width: '1.5rem', height: '1.5rem', color: '#1E40AF' }} />
              <h3 style={styles.logoText}>Mental Wellness</h3>
            </div>
            <p style={styles.description}>
              Your trusted partner in mental health care and wellness.
            </p>
          </div>
          <div style={styles.section}>
            <h4 style={styles.heading}>Quick Links</h4>
            <ul style={styles.linksList}>
              <li>
                <Link 
                  to="/about" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div style={styles.section}>
            <h4 style={styles.heading}>Support</h4>
            <ul style={styles.linksList}>
              <li>
                <Link 
                  to="/help" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  style={styles.link}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D1D5DB'}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div style={styles.divider}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} Mental Wellness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
