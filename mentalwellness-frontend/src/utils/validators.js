export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return !value || value.length <= max;
};

export const validatePassword = (password) => {
  const minLength = password && password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return {
    valid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUpperCase: !hasUpperCase ? 'Password must contain an uppercase letter' : null,
      hasLowerCase: !hasLowerCase ? 'Password must contain a lowercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain a number' : null,
    },
  };
};

export default {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePassword,
};

