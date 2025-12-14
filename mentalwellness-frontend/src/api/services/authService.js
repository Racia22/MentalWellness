import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const authService = {
  login: async (credentials) => {
    try {
      // axios interceptor returns response.data, so response is already the data object
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Log response for debugging
      console.log('Login response (full):', response);
      console.log('Login response type:', typeof response);
      console.log('Login response keys:', Object.keys(response || {}));
      
      // Backend returns camelCase due to JSON serializer config
      // Handle both camelCase and PascalCase for safety
      const token = response?.token || response?.Token;
      const userId = response?.userId || response?.UserId;
      const email = response?.email || response?.Email;
      const fullName = response?.fullName || response?.FullName;
      const userRole = response?.userRole || response?.UserRole;
      const expiresAt = response?.expiresAt || response?.ExpiresAt;
      
      console.log('Extracted values:', { token: token ? token.substring(0, 20) + '...' : 'MISSING', userId, email, fullName, userRole });
      
      if (!token) {
        console.error('Invalid login response - missing token. Full response:', JSON.stringify(response, null, 2));
        throw new Error('Invalid login response: Missing token');
      }
      
      if (!userId) {
        console.warn('Login response missing userId, but continuing...');
      }
      
      // Store token immediately
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage');
      
      // Construct user object from response
      const user = {
        userId: userId,
        email: email || '',
        fullName: fullName || '',
        role: userRole, // Map UserRole to role for frontend
        userRole: userRole || '',
        expiresAt: expiresAt,
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User stored in localStorage:', user);
      
      // Verify storage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('Verification - Token exists:', !!storedToken, 'User exists:', !!storedUser);
      
      // Return response with user object and token
      return { ...response, user, token };
    } catch (error) {
      console.error('Login error in authService:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Clear any partial data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Re-throw error so it can be handled by the caller
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data || response;
    } catch (error) {
      console.error('Registration error in authService:', error);
      // Re-throw axios errors so they can be handled properly
      throw error;
    }
  },
  changePassword: async (passwordData) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  },
  forgotPassword: async (email) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },
  resetPassword: async (resetData) => {
    return await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
  },
  updateProfile: async (profileData) => {
    return await axiosInstance.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
  },
  getUserById: async (userId) => {
    return await axiosInstance.get(API_ENDPOINTS.AUTH.GET_USER(userId));
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getToken: () => localStorage.getItem('token'),
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      // Handle cases where localStorage might contain the string "undefined" or invalid JSON
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Clear invalid data from localStorage
      localStorage.removeItem('user');
      return null;
    }
  },
};

export default authService;

