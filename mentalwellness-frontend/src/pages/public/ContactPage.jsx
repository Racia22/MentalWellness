import React, { useState } from 'react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import { handleSuccess, handleError } from '../../utils/errorHandler';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

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
    contactContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
    },
    cardH2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#1f2937',
    },
    infoItem: {
      padding: '1rem 0',
      borderBottom: '1px solid #e5e7eb',
      color: '#6b7280',
    },
    infoItemStrong: {
      color: '#1f2937',
      marginRight: '0.5rem',
    },
    contactForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    inputLabel: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement contact form submission
      handleSuccess('Thank you for your message. We will get back to you soon!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleError(error, 'Failed to send message');
    } finally {
      setLoading(false);
    }
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
          <h1 style={styles.pageTitle}>Contact Us</h1>
          <div style={styles.contactContent}>
            <Card style={{ padding: '1.5rem' }}>
              <h2 style={styles.cardH2}>Get in Touch</h2>
              <div style={styles.infoItem}>
                <strong style={styles.infoItemStrong}>Email:</strong> support@mentalwellness.com
              </div>
              <div style={styles.infoItem}>
                <strong style={styles.infoItemStrong}>Phone:</strong> +256 700 000 000
              </div>
              <div style={styles.infoItem}>
                <strong style={styles.infoItemStrong}>Address:</strong> Kampala, Uganda
              </div>
            </Card>
            <Card style={{ padding: '1.5rem' }}>
              <h2 style={styles.cardH2}>Send us a Message</h2>
              <form onSubmit={handleSubmit} style={styles.contactForm}>
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    style={styles.textarea}
                    required
                  />
                </div>
                <Button type="submit" loading={loading}>
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;

