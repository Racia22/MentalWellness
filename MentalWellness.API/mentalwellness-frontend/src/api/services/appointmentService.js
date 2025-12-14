import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const appointmentService = {
  getAllAppointments: async (filters = {}) => await axiosInstance.get(API_ENDPOINTS.APPOINTMENTS.GET_ALL, { params: filters }),
  getAppointmentById: async (appointmentId) => await axiosInstance.get(API_ENDPOINTS.APPOINTMENTS.GET_BY_ID(appointmentId)),
  createAppointment: async (appointmentData) => await axiosInstance.post(API_ENDPOINTS.APPOINTMENTS.CREATE, appointmentData),
  updateAppointment: async (appointmentId, appointmentData) => await axiosInstance.put(API_ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId), appointmentData),
  deleteAppointment: async (appointmentId) => await axiosInstance.delete(API_ENDPOINTS.APPOINTMENTS.DELETE(appointmentId)),
  cancelAppointment: async (appointmentId, reason = null) => await axiosInstance.post(API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId), { reason }),
};

export default appointmentService;

