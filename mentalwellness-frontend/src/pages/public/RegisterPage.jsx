import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import authService from '../../api/services/authService';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userRole: 'Patient',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
    select: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      backgroundColor: '#FFFFFF',
    },
    inputError: {
      borderColor: '#ef4444',
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
    checkboxLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      cursor: 'pointer',
    },
    checkbox: {
      width: '1rem',
      height: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.25rem',
      marginTop: '0.125rem',
    },
    checkboxText: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    link: {
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
    loginText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6B7280',
      marginTop: '1rem',
    },
    loginLink: {
      color: '#1E40AF',
      textDecoration: 'none',
      fontWeight: '500',
    },
  };

  const roleOptions = [
    { value: 'Patient', label: 'Patient' },
    { value: 'Doctor', label: 'Doctor' },
  ];

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
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else {
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasDigit = /\d/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
          newErrors.password = 'Password must contain uppercase, lowercase, digit, and special character';
        }
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone.replace(/\s+/g, '').replace(/-/g, '');
      const rwandanPhoneRegex = /^(\+250|250|0)?7\d{8}$/;
      if (!rwandanPhoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Invalid Rwandan phone number. Format: 0781234567 or +250781234567';
      }
    }
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
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
      const { confirmPassword, ...registerData } = formData;
      console.log('Registering with data:', registerData);
      const response = await authService.register(registerData);
      console.log('Registration response:', response);
      handleSuccess('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
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
            <UserPlus style={{ width: '2rem', height: '2rem', color: '#1E40AF' }} />
            <span style={styles.logoText}>Mental Wellness</span>
          </div>
          
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Sign up to get started</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Full Name */}
            <div style={styles.formGroup}>
              <label htmlFor="fullName" style={styles.label}>Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.fullName ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  if (!errors.fullName) {
                    e.currentTarget.style.borderColor = '#1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.fullName) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="Enter your full name"
                required
              />
              {errors.fullName && <p style={styles.errorText}>{errors.fullName}</p>}
            </div>

            {/* Email */}
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
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = '#1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p style={styles.errorText}>{errors.email}</p>}
            </div>

            {/* Role */}
            <div style={styles.formGroup}>
              <label htmlFor="userRole" style={styles.label}>Role</label>
              <select
                id="userRole"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1E40AF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div style={styles.formGroup}>
              <label htmlFor="phone" style={styles.label}>Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.phone ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  if (!errors.phone) {
                    e.currentTarget.style.borderColor = '#1E40AF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.phone) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="0781234567 or +250781234567"
                required
              />
              {errors.phone && <p style={styles.errorText}>{errors.phone}</p>}
            </div>

            {/* Password */}
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
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.currentTarget.style.borderColor = '#1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="Min 8 chars: uppercase, lowercase, digit, special"
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

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingRight: '3rem',
                    ...(errors.confirmPassword ? styles.inputError : {}),
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) {
                      e.currentTarget.style.borderColor = '#1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0A1D56'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  {showConfirmPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={styles.errorText}>{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>
                  I agree to the <Link to="/terms" style={styles.link}>Terms & Conditions</Link>
                </span>
              </label>
              {errors.terms && <p style={styles.errorText}>{errors.terms}</p>}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            {/* Login Link */}
            <p style={styles.loginText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.loginLink}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
