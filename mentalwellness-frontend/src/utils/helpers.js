export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    completed: 'green',
    cancelled: 'red',
    confirmed: 'blue',
    scheduled: 'blue',
    failed: 'red',
    approved: 'green',
    rejected: 'red',
  };
  return colors[status?.toLowerCase()] || 'gray';
};

export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || error.response.data?.error || 'An error occurred';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
};

export default {
  getInitials,
  classNames,
  debounce,
  getStatusColor,
  handleApiError,
};

