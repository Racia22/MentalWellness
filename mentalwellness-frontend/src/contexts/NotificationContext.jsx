import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import notificationService from '../api/services/notificationService';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Get authentication state inside the component so it updates
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth?.isAuthenticated || false;
  } catch (error) {
    // AuthContext not available (e.g., on public pages)
    isAuthenticated = false;
  }

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('NotificationContext: User not authenticated, skipping fetch');
      setNotifications([]);
      return;
    }
    console.log('NotificationContext: Fetching notifications...');
    setLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      console.log('NotificationContext: Raw response:', data);
      // Handle both array and object responses
      const notificationsArray = Array.isArray(data) ? data : (data?.notifications || data?.data || []);
      console.log('NotificationContext: Processed notifications:', notificationsArray.length, notificationsArray);
      setNotifications(notificationsArray);
    } catch (error) {
      console.error('NotificationContext: Failed to fetch notifications:', error);
      console.error('NotificationContext: Error response:', error.response?.data);
      console.error('NotificationContext: Error message:', error.message);
      console.error('NotificationContext: Error stack:', error.stack);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationService.getUnreadCount();
      const count = response?.unreadCount || response?.UnreadCount || response || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      // Refresh periodically - both notifications and count
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => {
          const notifId = notif.notificationId || notif.NotificationId;
          return notifId === id 
            ? { ...notif, isRead: true, IsRead: true, readAt: new Date(), ReadAt: new Date() }
            : notif;
        })
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

