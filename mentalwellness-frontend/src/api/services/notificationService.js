import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const notificationService = {
  getAllNotifications: async (isRead = null) => {
    try {
      const params = isRead !== null ? { isRead } : {};
      console.log('notificationService: Fetching from', API_ENDPOINTS.NOTIFICATIONS.GET_ALL, 'with params', params);
      const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params });
      console.log('notificationService: Response status:', response?.status);
      console.log('notificationService: Response data:', response?.data);
      // Handle both direct array and wrapped responses
      const data = response?.data || response;
      const result = Array.isArray(data) ? data : [];
      console.log('notificationService: Returning', result.length, 'notifications');
      return result;
    } catch (error) {
      console.error('notificationService: Error fetching notifications:', error);
      console.error('notificationService: Error response:', error.response?.data);
      console.error('notificationService: Error status:', error.response?.status);
      throw error;
    }
  },

  getNotificationById: async (id) => {
    return await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id));
  },

  markAsRead: async (id) => {
    return await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  markAllAsRead: async () => {
    return await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    const data = response?.data || response;
    return data?.unreadCount || data?.UnreadCount || data || 0;
  },
};

export default notificationService;
