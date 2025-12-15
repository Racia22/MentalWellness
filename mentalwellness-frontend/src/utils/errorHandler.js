import toast from 'react-hot-toast';

export const handleError = (error, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;

  if (error.response) {
    // Backend responded with error status
    const errorData = error.response.data;
    if (typeof errorData === 'string') {
      message = errorData;
    } else if (errorData?.message) {
      message = errorData.message;
      // If there are validation errors array, append them
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        message += ': ' + errorData.errors.join(', ');
      }
    } else if (errorData?.error) {
      message = errorData.error;
    } else if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      // Handle FluentValidation errors array
      message = errorData.errors.join('; ');
    } else {
      // For 401 Unauthorized
      if (error.response.status === 401) {
        message = 'Invalid email or password. Please check your credentials.';
      } else {
        message = defaultMessage;
      }
    }
  } else if (error.request || error.isNetworkError) {
    // Request was made but no response received
    message = 'Network error. Please check your connection and ensure the backend server is running on http://localhost:5245';
  } else if (error.message) {
    message = error.message;
  }

  toast.error(message);
  return message;
};

export const handleSuccess = (message = 'Operation completed successfully') => {
  toast.success(message);
};

export default {
  handleError,
  handleSuccess,
};

