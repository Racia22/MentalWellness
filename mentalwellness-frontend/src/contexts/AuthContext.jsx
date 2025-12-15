import React, { createContext, useState, useEffect } from 'react';
import authService from '../api/services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = () => {
      try {
        console.log('🔄 Initializing auth from localStorage...');
        const storedUser = authService.getStoredUser();
        const token = authService.getToken();
        
        console.log('🔍 Auth check:', {
          hasStoredUser: !!storedUser,
          hasToken: !!token,
          storedUser: storedUser,
          tokenLength: token?.length,
          userId: storedUser?.userId
        });
        
        // Only proceed if component is still mounted
        if (!isMounted) {
          console.log('⚠️ Component unmounted, skipping auth initialization');
          return;
        }
        
        // Validate that we have both user and token
        if (storedUser && token && storedUser.userId) {
          // Validate token is not empty
          if (token.trim() !== '') {
            // Only update state if component is still mounted
            if (isMounted) {
              setUser(storedUser);
              setIsAuthenticated(true);
              console.log('✅ Auth initialized from localStorage:', { 
                userId: storedUser.userId, 
                email: storedUser.email, 
                role: storedUser.userRole || storedUser.role 
              });
            }
          } else {
            console.warn('⚠️ Token is empty, clearing auth');
            if (isMounted) {
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log('ℹ️ No valid stored auth found:', {
            hasUser: !!storedUser,
            hasToken: !!token,
            hasUserId: !!storedUser?.userId
          });
          // Only clear if we have partial/invalid data
          // Don't clear if both are null (user just logged out or not logged in yet)
          if ((storedUser && !token) || (token && !storedUser) || (storedUser && !storedUser.userId)) {
            console.warn('⚠️ Invalid auth data detected, clearing');
            if (isMounted) {
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (isMounted) {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('✅ Auth initialization complete');
        }
      }
    };
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login process');
      
      // Clear any existing auth data before login
      authService.logout();
      console.log('🧹 AuthContext: Cleared existing auth data');
      
      const response = await authService.login(credentials);
      console.log('✅ AuthContext: Login response received:', response);
      
      // Get user from response - authService.login already constructs and stores the user
      const user = response.user || {
        userId: response.userId || response.UserId,
        email: response.email || response.Email,
        fullName: response.fullName || response.FullName,
        role: response.userRole || response.UserRole,
        userRole: response.userRole || response.UserRole,
      };
      
      console.log('🔍 AuthContext: User object:', user);
      
      // Validate user object has required fields
      if (!user || !user.userId) {
        console.error('❌ AuthContext: Invalid user data in login response:', response);
        throw new Error('User data not found in login response');
      }
      
      // Verify token was stored
      const token = authService.getToken();
      if (!token || token.trim() === '') {
        console.error('❌ AuthContext: Token not stored after login');
        throw new Error('Authentication token not received');
      }
      
      // Verify user was stored
      const storedUser = authService.getStoredUser();
      if (!storedUser || !storedUser.userId) {
        console.error('❌ AuthContext: User not stored after login');
        throw new Error('User data not stored after login');
      }
      
      // Set user and authentication state
      // Use a small delay to ensure localStorage is fully written
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Double-check storage before setting state
      const finalToken = authService.getToken();
      const finalStoredUser = authService.getStoredUser();
      
      if (!finalToken || !finalStoredUser || !finalStoredUser.userId) {
        console.error('❌ AuthContext: Auth data lost after storage, re-storing...');
        // Re-store if lost
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('✅ AuthContext: Login successful:', { 
        userId: user.userId, 
        email: user.email, 
        role: user.userRole || user.role,
        hasToken: !!finalToken,
        storedUserMatches: finalStoredUser?.userId === user.userId
      });
      
      return { ...response, user };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      // Clear any partial auth data on error
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    // Save updated user to localStorage
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    setUser: updateUser, // Use the new updateUser function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

