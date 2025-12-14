import { useState, useEffect, useCallback, useRef } from 'react';
import treatmentPlanService from '../api/services/treatmentPlanService';
import toast from 'react-hot-toast';

export const useTreatmentPlans = (filters = {}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  const mountedRef = useRef(true);

  // Update ref when filters change (stable comparison)
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.patientId !== filters.patientId ||
      filtersRef.current.doctorId !== filters.doctorId;
    
    if (filtersChanged) {
      filtersRef.current = filters;
    }
  }, [filters.patientId, filters.doctorId]);

  const fetchPlans = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // Don't fetch if required filter is missing
    const filters = filtersRef.current;
    if (!filters?.patientId && !filters?.doctorId) {
      if (mountedRef.current) {
        setLoading(false);
        setPlans([]);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await treatmentPlanService.getAllTreatmentPlans(filtersRef.current);
      if (mountedRef.current) {
        setPlans(data || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        // Don't show toast for 401/403 errors - these are expected permission errors
        const status = err.response?.status || err.status;
        if (status !== 401 && status !== 403) {
          toast.error('Failed to load treatment plans');
        }
        setPlans([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchPlans();
    
    return () => {
      mountedRef.current = false;
    };
  }, [filters.patientId, filters.doctorId, fetchPlans]);

  const createPlan = async (planData) => {
    try {
      const newPlan = await treatmentPlanService.createTreatmentPlan(planData);
      setPlans((prev) => [newPlan, ...prev]);
      toast.success('Treatment plan created successfully');
      return newPlan;
    } catch (err) {
      toast.error('Failed to create treatment plan');
      throw err;
    }
  };

  const updatePlan = async (id, planData) => {
    try {
      const updated = await treatmentPlanService.updateTreatmentPlan(id, planData);
      setPlans((prev) => prev.map((plan) => (plan.treatmentPlanId === id ? updated : plan)));
      toast.success('Treatment plan updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update treatment plan');
      throw err;
    }
  };

  const deletePlan = async (id) => {
    try {
      await treatmentPlanService.deleteTreatmentPlan(id);
      setPlans((prev) => prev.filter((plan) => plan.treatmentPlanId !== id));
      toast.success('Treatment plan deleted successfully');
    } catch (err) {
      toast.error('Failed to delete treatment plan');
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  };
};

export default useTreatmentPlans;

