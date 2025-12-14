import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const medicalRecordService = {
  getAllMedicalRecords: async (filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.MEDICAL_RECORDS.GET_ALL, { params: filters });
    // Handle both array and wrapped response
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getMedicalRecordById: async (recordId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.MEDICAL_RECORDS.GET_BY_ID(recordId));
    return response?.data || response;
  },
  createMedicalRecord: async (recordData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.MEDICAL_RECORDS.CREATE, recordData);
    return response?.data || response;
  },
  updateMedicalRecord: async (recordId, recordData) => {
    const response = await axiosInstance.put(API_ENDPOINTS.MEDICAL_RECORDS.UPDATE(recordId), recordData);
    return response?.data || response;
  },
  deleteMedicalRecord: async (recordId) => await axiosInstance.delete(API_ENDPOINTS.MEDICAL_RECORDS.DELETE(recordId)),
};

export default medicalRecordService;

