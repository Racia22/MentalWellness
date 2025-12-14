import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import authService from '../api/services/authService';

export const useUser = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const refreshUser = async () => {
    if (user?.userId) {
      try {
        const updatedUser = await authService.getUserById(user.userId);
        setUserData(updatedUser);
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  return { user: userData, refreshUser };
};

export default useUser;

