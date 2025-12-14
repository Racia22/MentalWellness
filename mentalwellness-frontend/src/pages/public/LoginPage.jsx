import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { handleError } from '../../utils/errorHandler';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    content: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '3rem',
      paddingBottom: '3rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    card: {
      width: '100%',
      maxWidth: '28rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0A1D56',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      textAlign: 'center',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    inputFocus: {
      borderColor: '#1E40AF',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
    },
    inputWrapper: {
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      transition: 'color 0.2s',
    },
    errorText: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#ef4444',
    },
    rememberForgot: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    },
    checkbox: {
      width: '1rem',
      height: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
    },
    checkboxText: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    forgotLink: {
      fontSize: '0.875rem',
      color: '#1E40AF',
      textDecoration: 'none',
    },
    button: {
      width: '100%',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    registerText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6B7280',
      marginTop: '1rem',
    },
    registerLink: {
      color: '#1E40AF',
      textDecoration: 'none',
      fontWeight: '500',
    },
    footerText: {
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#6B7280',
      marginTop: '1.5rem',
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      console.log('📝 LoginPage: Starting login process for:', formData.email);
      
      const response = await login(formData);
      console.log('✅ LoginPage: Login response received:', response);
      
      // Get user from response or localStorage
      const user = response?.user || JSON.parse(localStorage.getItem('user') || 'null');
      console.log('👤 LoginPage: User object:', user);
      
      if (!user) {
        console.error('❌ LoginPage: User data not found after login');
        // Try to get from localStorage directly
        const storedUserStr = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        console.log('🔍 LoginPage: Direct localStorage check:', {
          hasStoredUser: !!storedUserStr,
          hasToken: !!storedToken,
          storedUserStr: storedUserStr
        });
        throw new Error('User data not found after login');
      }
      
      // Get role - handle both camelCase and PascalCase
      const role = user?.role || user?.userRole || user?.UserRole;
      console.log('🎭 LoginPage: User role:', role);
      
      // Verify auth state is set
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('✅ LoginPage: Final verification before navigation:', {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
        userId: user.userId,
        role: role
      });
      
      if (!token || !storedUser) {
        console.error('❌ LoginPage: Auth data missing before navigation');
        throw new Error('Authentication data not properly stored');
      }
      
      // Verify auth state one more time before navigation
      const finalToken = localStorage.getItem('token');
      const finalUserStr = localStorage.getItem('user');
      
      if (!finalToken || !finalUserStr) {
        console.error('❌ LoginPage: Auth data lost before navigation, re-storing...');
        // Re-store from response
        if (response?.token) {
          localStorage.setItem('token', response.token);
        }
        if (response?.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      // Small delay to ensure state is set and persisted
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Final verification
      const verifiedToken = localStorage.getItem('token');
      const verifiedUser = JSON.parse(localStorage.getItem('user') || 'null');
      
      if (!verifiedToken || !verifiedUser || !verifiedUser.userId) {
        console.error('❌ LoginPage: Auth verification failed, cannot navigate');
        throw new Error('Authentication data not properly stored');
      }
      
      console.log('🚀 LoginPage: Navigating to dashboard for role:', role);
      
      // Navigate based on role
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role === 'Doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'Patient') {
        navigate('/patient/dashboard');
      } else {
        console.warn('⚠️ LoginPage: Unknown role, redirecting to home');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ LoginPage: Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      handleError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.content}>
        <div style={styles.card}>
          {/* Logo */}
          <div style={styles.logo}>
            <Lock style={{ width: '2rem', height: '2rem', color: '#1E40AF' }} />
            <span style={styles.logoText}>Mental Wellness</span>
          </div>
          
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Input */}
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {}),
                      borderColor: errors.email ? '#ef4444' : '#e5e7eb',
                    }}
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                    style={{
                      ...styles.input,
                      paddingRight: '3rem',
                      ...(errors.password ? styles.inputError : {}),
                      borderColor: errors.password ? '#ef4444' : '#e5e7eb',
                    }}
                    onFocus={(e) => {
                      if (!errors.password) {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0A1D56'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
              {errors.password && <p style={styles.errorText}>{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={styles.rememberForgot}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Remember me</span>
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading || false ? styles.buttonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1E40AF';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <p style={styles.registerText}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.registerLink}>Register</Link>
            </p>
          </form>

          {/* Footer Text */}
          <p style={styles.footerText}>Secure & Confidential</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
