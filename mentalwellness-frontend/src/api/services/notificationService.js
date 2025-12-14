import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const notificationService = {
  getAllNotifications: async (filters = {}) => await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params: filters }),
  getNotificationById: async (notificationId) => await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(notificationId)),
  markAsRead: async (notificationId) => await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)),
  markAllAsRead: async () => await axiosInstance.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  getUnreadCount: async () => await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
};

export default notificationService;

