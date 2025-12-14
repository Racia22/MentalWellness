import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const adminService = {
  getDashboardStats: async () => await axiosInstance.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getAllUsers: async (filters = {}) => {
    const params = {};
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== undefined && filters.isActive !== null) params.isActive = filters.isActive;
    return await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, { params });
  },
  getAllDoctorUsers: async (isApproved = null) => {
    const params = isApproved !== null ? { isApproved } : {};
    return await axiosInstance.get(API_ENDPOINTS.ADMIN.DOCTORS, { params });
  },
  activateUser: async (userId) => await axiosInstance.post(API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId)),
  deactivateUser: async (userId) => await axiosInstance.post(API_ENDPOINTS.ADMIN.DEACTIVATE_USER(userId)),
  resetUserPassword: async (userId, newPassword) => 
    await axiosInstance.post(API_ENDPOINTS.ADMIN.RESET_USER_PASSWORD(userId), { newPassword }),
};

export default adminService;

