import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const paymentService = {
  getAllPayments: async (filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.GET_ALL, { params: filters });
    // Handle both array and wrapped response
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getPaymentById: async (paymentId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.GET_BY_ID(paymentId));
    return response?.data || response;
  },
  getPaymentsByDoctor: async (doctorId, filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.GET_BY_DOCTOR(doctorId), { params: filters });
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getPaymentStats: async (filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.STATS, { params: filters });
    return response?.data || response;
  },
  processRefund: async (paymentId, refundData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), refundData);
    return response?.data || response;
  },
  initiatePayment: async (paymentData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.INITIATE, paymentData);
    return response?.data || response;
  },
  handleCallback: async (callbackData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.CALLBACK, callbackData);
    return response?.data || response;
  },
  downloadInvoice: async (paymentId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.DOWNLOAD_INVOICE(paymentId), {
      responseType: 'blob', // Important for downloading files
    });
    return response;
  },
  confirmPayment: async (paymentId, transactionData) => {
    // Simulate payment confirmation - in real app, this would be handled by payment gateway callback
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.CALLBACK, {
      transactionReference: transactionData.transactionReference,
      paymentStatus: 'Completed',
      providerTransactionId: transactionData.providerTransactionId || `PROV-${Date.now()}`,
      providerResponse: 'Payment successful',
    });
    return response?.data || response;
  },
};

export default paymentService;

