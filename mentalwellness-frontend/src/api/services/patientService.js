import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const patientService = {
  getAllPatients: async () => await axiosInstance.get(API_ENDPOINTS.PATIENTS.GET_ALL),
  getPatientById: async (patientId) => await axiosInstance.get(API_ENDPOINTS.PATIENTS.GET_BY_ID(patientId)),
  getPatientByUserId: async (userId) => await axiosInstance.get(API_ENDPOINTS.PATIENTS.GET_BY_USER_ID(userId)),
  createPatient: async (patientData) => await axiosInstance.post(API_ENDPOINTS.PATIENTS.CREATE, patientData),
  updatePatient: async (patientId, patientData) => await axiosInstance.put(API_ENDPOINTS.PATIENTS.UPDATE(patientId), patientData),
  deletePatient: async (patientId) => await axiosInstance.delete(API_ENDPOINTS.PATIENTS.DELETE(patientId)),
};

export default patientService;

