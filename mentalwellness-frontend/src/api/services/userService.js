import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const userService = {
  getAllUsers: async () => await axiosInstance.get(API_ENDPOINTS.USERS.GET_ALL),
  getUserById: async (userId) => await axiosInstance.get(API_ENDPOINTS.USERS.GET_BY_ID(userId)),
  createUser: async (userData) => await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, userData),
  updateUser: async (userId, userData) => await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE(userId), userData),
  deleteUser: async (userId) => await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(userId)),
};

export default userService;

