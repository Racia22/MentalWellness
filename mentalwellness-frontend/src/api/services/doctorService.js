import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const doctorService = {
  getAllDoctors: async (isApproved = null) => {
    const params = isApproved !== null ? { isApproved } : {};
    return await axiosInstance.get(API_ENDPOINTS.DOCTORS.GET_ALL, { params });
  },
  getDoctorById: async (doctorId) => await axiosInstance.get(API_ENDPOINTS.DOCTORS.GET_BY_ID(doctorId)),
  getDoctorByUserId: async (userId) => await axiosInstance.get(API_ENDPOINTS.DOCTORS.GET_BY_USER_ID(userId)),
  createDoctor: async (doctorData) => await axiosInstance.post(API_ENDPOINTS.DOCTORS.CREATE, doctorData),
  updateDoctor: async (doctorId, doctorData) => await axiosInstance.put(API_ENDPOINTS.DOCTORS.UPDATE(doctorId), doctorData),
  deleteDoctor: async (doctorId) => await axiosInstance.delete(API_ENDPOINTS.DOCTORS.DELETE(doctorId)),
  approveDoctor: async (doctorId) => await axiosInstance.post(API_ENDPOINTS.DOCTORS.APPROVE(doctorId)),
};

export default doctorService;

