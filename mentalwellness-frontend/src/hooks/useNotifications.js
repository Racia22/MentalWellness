import { useState, useEffect, useCallback } from 'react';
import notificationService from '../api/services/notificationService';
import { handleError } from '../utils/errorHandler';

export const useNotifications = (options = {}) => {
  const { autoFetch = true, isRead = null } = options;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getAllNotifications(isRead);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load notifications';
      setError(errorMessage);
      handleError(err, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isRead]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => 
          n.notificationId === id || n.NotificationId === id
            ? { ...n, isRead: true, IsRead: true, readAt: new Date(), ReadAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      handleError(err, 'Failed to mark notification as read');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, IsRead: true, readAt: new Date(), ReadAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      handleError(err, 'Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch, fetchNotifications, fetchUnreadCount]);

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!autoFetch) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoFetch, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
