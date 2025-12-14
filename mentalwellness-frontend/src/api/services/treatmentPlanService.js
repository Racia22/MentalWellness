import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const treatmentPlanService = {
  getAllTreatmentPlans: async (filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.TREATMENT_PLANS.GET_ALL, { params: filters });
    // Handle both array and wrapped response
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getTreatmentPlanById: async (planId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.TREATMENT_PLANS.GET_BY_ID(planId));
    return response?.data || response;
  },
  createTreatmentPlan: async (planData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.TREATMENT_PLANS.CREATE, planData);
    return response?.data || response;
  },
  updateTreatmentPlan: async (planId, planData) => {
    const response = await axiosInstance.put(API_ENDPOINTS.TREATMENT_PLANS.UPDATE(planId), planData);
    return response?.data || response;
  },
  deleteTreatmentPlan: async (planId) => await axiosInstance.delete(API_ENDPOINTS.TREATMENT_PLANS.DELETE(planId)),
};

export default treatmentPlanService;

