import { useState, useEffect, useCallback, useRef } from 'react';
import appointmentService from '../api/services/appointmentService';
import toast from 'react-hot-toast';

export const useAppointments = (filters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  const mountedRef = useRef(true);

  // Update ref when filters change (stable comparison)
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.patientId !== filters.patientId ||
      filtersRef.current.patientUserId !== filters.patientUserId ||
      filtersRef.current.doctorId !== filters.doctorId ||
      filtersRef.current.doctorUserId !== filters.doctorUserId ||
      filtersRef.current.status !== filters.status;
    
    if (filtersChanged) {
      filtersRef.current = filters;
    }
  }, [filters.patientId, filters.patientUserId, filters.doctorId, filters.doctorUserId, filters.status]);

  const fetchAppointments = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAllAppointments(filtersRef.current);
      if (mountedRef.current) {
        setAppointments(data || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load appointments');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAppointments();
    
    return () => {
      mountedRef.current = false;
    };
  }, [filters.patientId, filters.patientUserId, filters.doctorId, filters.doctorUserId, filters.status, fetchAppointments]);

  const createAppointment = async (appointmentData) => {
    try {
      console.log('useAppointments: Creating appointment with data:', appointmentData);
      const response = await appointmentService.createAppointment(appointmentData);
      // Axios interceptor returns response.data directly, so response is already the appointment object
      const newAppointment = response;
      console.log('useAppointments: Appointment created:', newAppointment);
      if (newAppointment) {
        setAppointments((prev) => [newAppointment, ...prev]);
      }
      // Don't show toast here - let the component handle it
      return newAppointment;
    } catch (err) {
      console.error('useAppointments: Error creating appointment:', err);
      console.error('useAppointments: Error response:', err.response?.data);
      console.error('useAppointments: Full error:', err);
      // Don't show toast here - let the component handle it with more specific error messages
      throw err;
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      const updated = await appointmentService.updateAppointment(id, appointmentData);
      // Handle both camelCase and PascalCase response
      const updatedAppointment = updated.data || updated;
      setAppointments((prev) => prev.map((apt) => {
        const aptId = apt.appointmentId || apt.AppointmentId;
        const updatedId = updatedAppointment.appointmentId || updatedAppointment.AppointmentId || id;
        return aptId === updatedId ? updatedAppointment : apt;
      }));
      toast.success('Appointment updated successfully');
      // Refresh appointments to ensure we have the latest data
      await fetchAppointments();
      return updatedAppointment;
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error('Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((apt) => apt.appointmentId !== id));
      toast.success('Appointment deleted successfully');
    } catch (err) {
      toast.error('Failed to delete appointment');
      throw err;
    }
  };

  const cancelAppointment = async (id, reason) => {
    try {
      await appointmentService.cancelAppointment(id, reason);
      await fetchAppointments();
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel appointment');
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
  };
};

export default useAppointments;

