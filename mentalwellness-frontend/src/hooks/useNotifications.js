import { useState, useEffect, useCallback } from 'react';
import notificationService from '../api/services/notificationService';
import toast from 'react-hot-toast';

export const useNotifications = (filters = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAllNotifications(filters);
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
      // Only show toast if we're actually trying to fetch (not on public pages)
      if (filters && Object.keys(filters).length > 0) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response?.unreadCount || 0);
    } catch (err) {
      // Silently fail - don't spam console
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.notificationId === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark notification as read');
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
  };
};

export default useNotifications;

