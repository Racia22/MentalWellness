import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
  } catch (error) {
    // AuthContext not available, user will be null
    console.warn('AuthContext not available in UserProvider');
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

