import { useState, useEffect, useCallback, useRef } from 'react';
import paymentService from '../api/services/paymentService';
import toast from 'react-hot-toast';

export const usePayments = (filters = {}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  const mountedRef = useRef(true);

  // Update ref when filters change (stable comparison)
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.patientId !== filters.patientId ||
      filtersRef.current.status !== filters.status;
    
    if (filtersChanged) {
      filtersRef.current = filters;
    }
  }, [filters.patientId, filters.status]);

  const fetchPayments = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // Backend automatically filters by authenticated user, so we can fetch without patientId
    setLoading(true);
    setError(null);
    try {
      const filters = filtersRef.current;
      // Only include non-null filters
      const queryFilters = {};
      if (filters?.patientId) queryFilters.patientId = filters.patientId;
      if (filters?.appointmentId) queryFilters.appointmentId = filters.appointmentId;
      if (filters?.status) queryFilters.status = filters.status;
      
      const data = await paymentService.getAllPayments(queryFilters);
      if (mountedRef.current) {
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load payments');
        setPayments([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPayments();
    
    return () => {
      mountedRef.current = false;
    };
  }, [filters.patientId, filters.status, fetchPayments]);

  const initiatePayment = async (paymentData) => {
    try {
      const payment = await paymentService.initiatePayment(paymentData);
      toast.success('Payment initiated successfully');
      return payment;
    } catch (err) {
      toast.error('Failed to initiate payment');
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    initiatePayment,
  };
};

export default usePayments;

