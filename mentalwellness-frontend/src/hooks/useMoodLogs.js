import { useState, useEffect, useCallback, useRef } from 'react';
import moodLogService from '../api/services/moodLogService';
import toast from 'react-hot-toast';

export const useMoodLogs = (filters = {}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  const mountedRef = useRef(true);

  // Update ref when filters change (stable comparison)
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.patientId !== filters.patientId;
    
    if (filtersChanged) {
      filtersRef.current = filters;
    }
  }, [filters.patientId]);

  const fetchLogs = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // Check if token exists before making request
    const token = localStorage.getItem('token');
    if (!token) {
      if (mountedRef.current) {
        setError('No authentication token found');
        setLoading(false);
        setLogs([]);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const filters = filtersRef.current;
      
      // For patients viewing their own logs, use the general endpoint
      // For doctors viewing patient logs, use the patient-specific endpoint
      // Check if we're viewing someone else's logs (doctor viewing patient)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isViewingOwnLogs = !filters?.patientId || 
        (user?.userRole === 'Patient' && filters.patientId === user?.patientId);
      
      if (filters?.patientId && !isViewingOwnLogs) {
        // Doctor viewing patient's logs - use patient-specific endpoint
        const data = await moodLogService.getMoodLogsByPatientId(filters.patientId);
        if (mountedRef.current) {
          setLogs(Array.isArray(data) ? data : []);
        }
      } else {
        // Patient viewing own logs or no patientId - use general endpoint
        const queryFilters = {};
        if (filters?.patientId && isViewingOwnLogs) {
          // For patients, backend will filter by authenticated user
          // Don't pass patientId as query param
        }
        if (filters?.startDate) queryFilters.startDate = filters.startDate;
        if (filters?.endDate) queryFilters.endDate = filters.endDate;
        
        const data = await moodLogService.getAllMoodLogs(queryFilters);
        if (mountedRef.current) {
          setLogs(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        const status = err.response?.status || err.status;
        
        // Log error for debugging
        console.error('Error fetching mood logs:', err);
        console.error('Error status:', status);
        console.error('Error response:', err.response?.data);
        
        // Handle 401 Unauthorized - redirect to login
        if (status === 401) {
          const token = localStorage.getItem('token');
          if (token) {
            // Token exists but is invalid/expired - clear it and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
        // Don't show toast for 401/403/404 errors - these are expected permission/not found errors
        else if (status !== 403 && status !== 404) {
          toast.error('Failed to load mood logs');
        }
        setLogs([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLogs();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchLogs]);

  const createLog = async (logData) => {
    try {
      const newLog = await moodLogService.createMoodLog(logData);
      setLogs((prev) => [newLog, ...prev]);
      toast.success('Mood log created successfully');
      return newLog;
    } catch (err) {
      toast.error('Failed to create mood log');
      throw err;
    }
  };

  const updateLog = async (id, logData) => {
    try {
      const updated = await moodLogService.updateMoodLog(id, logData);
      setLogs((prev) => prev.map((log) => (log.moodLogId === id ? updated : log)));
      toast.success('Mood log updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update mood log');
      throw err;
    }
  };

  const deleteLog = async (id) => {
    try {
      await moodLogService.deleteMoodLog(id);
      setLogs((prev) => prev.filter((log) => log.moodLogId !== id));
      toast.success('Mood log deleted successfully');
    } catch (err) {
      toast.error('Failed to delete mood log');
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    fetchLogs,
    createLog,
    updateLog,
    deleteLog,
  };
};

export default useMoodLogs;

