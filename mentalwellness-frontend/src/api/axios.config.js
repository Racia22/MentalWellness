import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Validate and set BASE_URL
const BASE_URL = API_CONFIG.BASE_URL || 'http://localhost:5245/api';

// Ensure BASE_URL is a valid URL
if (!BASE_URL.startsWith('http://') && !BASE_URL.startsWith('https://')) {
  console.error('❌ Invalid BASE_URL - must start with http:// or https://');
  console.error('Current BASE_URL:', BASE_URL);
}

// Log API config for debugging
console.log('🔧 API Configuration:', {
  BASE_URL: BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
  envVar: import.meta.env.VITE_API_BASE_URL,
  isValid: BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request URL for debugging
    const fullUrl = config.baseURL + config.url;
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullUrl,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log error details for debugging
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? (error.config.baseURL + error.config.url) : 'N/A',
      response: error.response?.data
    });
    
    // Handle network errors (CORS, connection issues, etc.)
    if (!error.response) {
      // Network error - could be CORS, connection refused, etc.
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED') {
        const fullUrl = error.config ? (error.config.baseURL + error.config.url) : 'unknown';
        console.error('❌ Network Error Details:', {
          attemptedURL: fullUrl,
          baseURL: error.config?.baseURL,
          endpoint: error.config?.url,
          errorCode: error.code,
          errorMessage: error.message
        });
        
        const networkError = new Error(`Network error connecting to ${fullUrl}. Please check your connection and ensure the backend server is running at ${error.config?.baseURL || 'http://localhost:5245/api'}.`);
        networkError.isNetworkError = true;
        return Promise.reject(networkError);
      }
    }
    
    // Handle 401 Unauthorized - only logout if it's a real auth issue
    // Don't logout on 401 from login/register endpoints (these are expected)
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/api/auth/login') || 
                          requestUrl.includes('/api/auth/register') ||
                          requestUrl.includes('/api/auth/forgot-password') ||
                          requestUrl.includes('/api/auth/reset-password');
    
    // Handle 404 errors - don't logout for these (missing resources are normal)
    if (error.response?.status === 404) {
      const errorMessage = error.response?.data?.message || error.message || '';
      console.warn('404 Not Found:', errorMessage, '- URL:', requestUrl);
      // Never logout on 404 errors - these are expected for missing resources
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Check if this is a token expiration/invalid token issue
      // by checking if we have a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // No token means user is not logged in, don't do anything
        return Promise.reject(error);
      }
      
      // If we have a token but got 401, it might be expired or invalid
      // Only logout if the error message suggests authentication failure
      const errorMessage = error.response?.data?.message || error.message || '';
      const isAuthError = errorMessage.toLowerCase().includes('unauthorized') || 
                         errorMessage.toLowerCase().includes('token') ||
                         errorMessage.toLowerCase().includes('authentication') ||
                         errorMessage.toLowerCase().includes('expired') ||
                         errorMessage.toLowerCase().includes('invalid token');
      
      if (isAuthError) {
        console.warn('401 Unauthorized - logging out user:', errorMessage);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // 401 but not an auth error - might be a permission issue, don't logout
        console.warn('401 received but not an auth error:', errorMessage);
      }
    }
    
    // Handle 403 Forbidden - don't logout, just reject the error
    // 403 means user is authenticated but doesn't have permission
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

