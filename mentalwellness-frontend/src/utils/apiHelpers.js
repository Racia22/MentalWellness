import axiosInstance from '../api/axios.config';

export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });
    return { data: response, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const handleResponse = (response) => {
  if (response.error) {
    throw response.error;
  }
  return response.data;
};

export default {
  apiCall,
  handleResponse,
};

