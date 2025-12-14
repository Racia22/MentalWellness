import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const feedbackService = {
  getAllFeedbacks: async (filters = {}) => await axiosInstance.get(API_ENDPOINTS.FEEDBACK.GET_ALL, { params: filters }),
  getFeedbackById: async (feedbackId) => await axiosInstance.get(API_ENDPOINTS.FEEDBACK.GET_BY_ID(feedbackId)),
  createFeedback: async (feedbackData) => await axiosInstance.post(API_ENDPOINTS.FEEDBACK.CREATE, feedbackData),
  updateFeedback: async (feedbackId, feedbackData) => await axiosInstance.put(API_ENDPOINTS.FEEDBACK.UPDATE(feedbackId), feedbackData),
  deleteFeedback: async (feedbackId) => await axiosInstance.delete(API_ENDPOINTS.FEEDBACK.DELETE(feedbackId)),
  approveFeedback: async (feedbackId) => await axiosInstance.post(API_ENDPOINTS.FEEDBACK.APPROVE(feedbackId)),
  respondToFeedback: async (feedbackId, response) => await axiosInstance.post(API_ENDPOINTS.FEEDBACK.RESPOND(feedbackId), { response }),
};

export default feedbackService;

