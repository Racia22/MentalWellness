import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import { handleSuccess, handleError } from '../../utils/errorHandler';
import authService from '../../api/services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

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
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      handleError(new Error('Email is required'), 'Please enter your email address');
      return;
    }

    if (!token || !token.trim()) {
      handleError(new Error('Reset token is missing'), 'Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!password || password.length < 8) {
      handleError(new Error('Password too short'), 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      handleError(new Error('Passwords do not match'), 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword: password,
      });
      handleSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      handleError(error, 'Failed to reset password. The link may have expired. Please request a new one.');
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
              Enter your new password below.
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
                disabled={!!searchParams.get('email')}
              />
              {!searchParams.get('token') && (
                <Input
                  label="Reset Token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Enter reset token"
                />
              )}
              <Input
                label="New Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password (min 8 characters)"
                minLength={8}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength={8}
              />
              <Button type="submit" loading={loading} style={styles.button}>
                Reset Password
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

export default ResetPasswordPage;

