import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import { handleSuccess, handleError } from '../../utils/errorHandler';
import authService from '../../api/services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = {
    page: {
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
    },
    container: {
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      zIndex: 1,
    },
    card: {
      padding: '2.5rem',
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.98)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderRadius: '0.5rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      textAlign: 'center',
      margin: '0 0 0.5rem 0',
      color: '#1f2937',
    },
    subtitle: {
      textAlign: 'center',
      color: '#6b7280',
      margin: '0 0 2rem 0',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    button: {
      width: '100%',
    },
    backToLogin: {
      textAlign: 'center',
      color: '#6b7280',
      fontSize: '0.875rem',
      margin: 0,
    },
    backToLoginA: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: 500,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      handleError(new Error('Email is required'), 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      handleSuccess('If an account with that email exists, password reset instructions have been sent to your email. Please check the console for the reset link in development mode.');
      setEmail('');
    } catch (error) {
      handleError(error, 'Failed to send reset email. Please check the console for the reset link in development mode.');
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
          <Card style={styles.card}>
            <h1 style={styles.title}>Reset Password</h1>
            <p style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handleSubmit} style={styles.form}>
              <Input
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
              <Button type="submit" loading={loading} style={styles.button}>
                Send Reset Instructions
              </Button>
              <p style={styles.backToLogin}>
                <Link to="/login" style={styles.backToLoginA}>Back to Login</Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;

