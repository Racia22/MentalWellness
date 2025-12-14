import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

// Check if token exists and is valid
const checkToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }
  // Basic token validation - check if it's not empty
  if (token.trim() === '') {
    throw new Error('Invalid authentication token. Please log in again.');
  }
  return token;
};

export const moodLogService = {
  getAllMoodLogs: async (filters = {}) => {
    checkToken(); // Verify token exists before making request
    const response = await axiosInstance.get(API_ENDPOINTS.MOOD_LOGS.GET_ALL, { params: filters });
    // Handle both array and wrapped response
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getMoodLogsByPatientId: async (patientId) => {
    checkToken(); // Verify token exists before making request
    if (!patientId) {
      throw new Error('Patient ID is required');
    }
    const response = await axiosInstance.get(API_ENDPOINTS.MOOD_LOGS.GET_BY_PATIENT_ID(patientId));
    // Handle both array and wrapped response
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getMoodLogById: async (logId) => {
    checkToken();
    const response = await axiosInstance.get(API_ENDPOINTS.MOOD_LOGS.GET_BY_ID(logId));
    return response?.data || response;
  },
  createMoodLog: async (logData) => {
    checkToken();
    const response = await axiosInstance.post(API_ENDPOINTS.MOOD_LOGS.CREATE, logData);
    return response?.data || response;
  },
  updateMoodLog: async (logId, logData) => {
    checkToken();
    const response = await axiosInstance.put(API_ENDPOINTS.MOOD_LOGS.UPDATE(logId), logData);
    return response?.data || response;
  },
  deleteMoodLog: async (logId) => {
    checkToken();
    return await axiosInstance.delete(API_ENDPOINTS.MOOD_LOGS.DELETE(logId));
  },
};

export default moodLogService;

