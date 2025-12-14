import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const authService = {
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login for email:', credentials.email);
      
      // Clear any existing auth data before login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🧹 Cleared existing auth data');
      
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Log full response for debugging
      console.log('✅ Login response received:', JSON.stringify(response, null, 2));
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', Object.keys(response || {}));
      
      // Handle both camelCase and PascalCase response formats
      // Backend JSON serialization converts to camelCase, but check both just in case
      const token = response?.token || response?.Token || response?.data?.token || response?.data?.Token;
      const userId = response?.userId || response?.UserId || response?.data?.userId || response?.data?.UserId;
      const email = response?.email || response?.Email || response?.data?.email || response?.data?.Email;
      const fullName = response?.fullName || response?.FullName || response?.data?.fullName || response?.data?.FullName;
      const userRole = response?.userRole || response?.UserRole || response?.data?.userRole || response?.data?.UserRole;
      const expiresAt = response?.expiresAt || response?.ExpiresAt || response?.data?.expiresAt || response?.data?.ExpiresAt;
      
      console.log('🔍 Extracted values:', {
        hasToken: !!token,
        hasUserId: !!userId,
        hasEmail: !!email,
        hasFullName: !!fullName,
        hasUserRole: !!userRole,
        tokenLength: token?.length,
        userId: userId,
        email: email,
        userRole: userRole
      });
      
      // Validate response has required data
      if (!response) {
        console.error('❌ Login response is null or undefined');
        throw new Error('Invalid login response: No data received');
      }
      
      if (!token || token.trim() === '') {
        console.error('❌ Login response missing token. Full response:', response);
        throw new Error('Invalid login response: Missing authentication token');
      }
      
      if (!userId) {
        console.error('❌ Login response missing userId. Full response:', response);
        throw new Error('Invalid login response: Missing user ID');
      }
      
      if (!email) {
        console.error('❌ Login response missing email. Full response:', response);
        throw new Error('Invalid login response: Missing email');
      }
      
      if (!userRole) {
        console.error('❌ Login response missing userRole. Full response:', response);
        throw new Error('Invalid login response: Missing user role');
      }
      
      // Construct user object from response FIRST (before storage)
      const user = {
        userId: userId,
        email: email,
        fullName: fullName || email, // Fallback to email if fullName is missing
        role: userRole, // Map UserRole to role for frontend
        userRole: userRole,
        expiresAt: expiresAt,
      };
      
      // Validate user object before storing
      if (!user.userId || !user.email || !user.userRole) {
        console.error('❌ Invalid user object constructed:', user);
        throw new Error('Invalid user data structure');
      }
      
      // Store token first - use try-catch to handle localStorage errors
      try {
        localStorage.setItem('token', token);
        console.log('💾 Token stored in localStorage, length:', token.length);
      } catch (storageError) {
        console.error('❌ Failed to store token:', storageError);
        throw new Error('Failed to store token in localStorage: ' + storageError.message);
      }
      
      // Store user - use try-catch to handle localStorage errors
      try {
        const userJson = JSON.stringify(user);
        localStorage.setItem('user', userJson);
        console.log('💾 User stored in localStorage:', user);
        console.log('💾 User JSON length:', userJson.length);
      } catch (storageError) {
        console.error('❌ Failed to store user:', storageError);
        // Clean up token if user storage failed
        localStorage.removeItem('token');
        throw new Error('Failed to store user in localStorage: ' + storageError.message);
      }
      
      // Verify storage immediately with multiple checks
      let storedToken = null;
      let storedUserStr = null;
      
      try {
        storedToken = localStorage.getItem('token');
        storedUserStr = localStorage.getItem('user');
      } catch (readError) {
        console.error('❌ Failed to read from localStorage:', readError);
        throw new Error('Failed to verify stored authentication data: ' + readError.message);
      }
      
      console.log('✅ Verification:', {
        tokenStored: !!storedToken,
        tokenLength: storedToken?.length,
        tokenMatches: storedToken === token,
        userStored: !!storedUserStr,
        userStrLength: storedUserStr?.length
      });
      
      if (!storedToken || !storedUserStr) {
        console.error('❌ Failed to store auth data in localStorage');
        throw new Error('Failed to store authentication data');
      }
      
      // Verify token matches
      if (storedToken !== token) {
        console.error('❌ Stored token does not match original token');
        throw new Error('Token storage verification failed');
      }
      
      // Parse stored user to verify it's valid JSON
      let parsedUser = null;
      try {
        parsedUser = JSON.parse(storedUserStr);
        console.log('✅ Stored user parsed successfully:', parsedUser);
        
        // Verify parsed user matches original
        if (parsedUser.userId !== user.userId || parsedUser.email !== user.email) {
          console.error('❌ Parsed user does not match original user');
          throw new Error('User data verification failed');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse stored user:', parseError);
        // Clean up invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Failed to store valid user data: ' + parseError.message);
      }
      
      return { ...response, user, token }; // Return response with user object and token
    } catch (error) {
      console.error('❌ Login error in authService:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Clear any partial data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🧹 Cleared auth data due to error');
      
      // If it's an axios error, preserve the original error
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || error.message;
        
        if (status === 401) {
          throw new Error('Invalid email or password');
        } else if (status === 403) {
          throw new Error('Account is inactive. Please contact support.');
        } else {
          throw new Error(message || 'Login failed. Please try again.');
        }
      }
      throw error;
    }
  },
  register: async (userData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response;
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

