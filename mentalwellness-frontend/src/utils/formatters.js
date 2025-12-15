import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date, formatStr = 'short') => {
  if (!date) return '-';
  
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // Try parsing ISO string first
    try {
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } catch {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }
  
  if (!isValid(dateObj)) {
    return '-';
  }
  
  if (formatStr === 'short') {
    return format(dateObj, 'MMM d, yyyy');
  }
  if (formatStr === 'long') {
    return format(dateObj, 'MMMM d, yyyy');
  }
  if (formatStr === 'datetime') {
    return format(dateObj, 'MMM d, yyyy h:mm a');
  }
  if (formatStr === 'month-year') {
    return format(dateObj, 'MMM yyyy');
  }
  return format(dateObj, formatStr);
};

export const formatCurrency = (amount, currency = 'RWF') => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatTime = (time) => {
  if (!time) return '-';
  if (time instanceof Date) {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof time === 'string') {
    // Check if it's a full datetime string
    if (time.includes('T') || time.includes(' ')) {
      return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    // Assume it's just a time string like "14:30:00"
    const d = new Date(`2000-01-01T${time}`);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return '-';
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

export default {
  formatDate,
  formatCurrency,
  formatTime,
  truncate,
  capitalize,
  formatPhoneNumber,
};

