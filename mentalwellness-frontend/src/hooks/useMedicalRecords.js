import { useState, useEffect, useCallback, useRef } from 'react';
import medicalRecordService from '../api/services/medicalRecordService';
import toast from 'react-hot-toast';

export const useMedicalRecords = (filters = {}) => {
  const [records, setRecords] = useState([]);
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

  const fetchRecords = useCallback(async () => {
    if (!mountedRef.current) return;
    
    // Don't fetch if required filter is missing
    const filters = filtersRef.current;
    if (!filters?.patientId && !filters?.doctorId) {
      if (mountedRef.current) {
        setLoading(false);
        setRecords([]);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await medicalRecordService.getAllMedicalRecords(filtersRef.current);
      if (mountedRef.current) {
        setRecords(data || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        // Don't show toast for 401/403 errors - these are expected permission errors
        const status = err.response?.status || err.status;
        if (status !== 401 && status !== 403) {
          toast.error('Failed to load medical records');
        }
        setRecords([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRecords();
    
    return () => {
      mountedRef.current = false;
    };
  }, [filters.patientId, filters.doctorId, fetchRecords]);

  const createRecord = async (recordData) => {
    try {
      const newRecord = await medicalRecordService.createMedicalRecord(recordData);
      setRecords((prev) => [newRecord, ...prev]);
      toast.success('Medical record created successfully');
      return newRecord;
    } catch (err) {
      toast.error('Failed to create medical record');
      throw err;
    }
  };

  const updateRecord = async (id, recordData) => {
    try {
      const updated = await medicalRecordService.updateMedicalRecord(id, recordData);
      setRecords((prev) => prev.map((rec) => (rec.medicalRecordId === id ? updated : rec)));
      toast.success('Medical record updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update medical record');
      throw err;
    }
  };

  const deleteRecord = async (id) => {
    try {
      await medicalRecordService.deleteMedicalRecord(id);
      setRecords((prev) => prev.filter((rec) => rec.medicalRecordId !== id));
      toast.success('Medical record deleted successfully');
    } catch (err) {
      toast.error('Failed to delete medical record');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};

export default useMedicalRecords;

