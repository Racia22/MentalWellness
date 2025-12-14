import { useState, useEffect, useCallback, useRef } from 'react';
import feedbackService from '../api/services/feedbackService';
import toast from 'react-hot-toast';

export const useFeedback = (filters = {}) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersRef = useRef(filters);
  const mountedRef = useRef(true);

  // Update ref when filters change (stable comparison)
  useEffect(() => {
    const filtersChanged = 
      filtersRef.current.doctorId !== filters.doctorId ||
      filtersRef.current.isApproved !== filters.isApproved;
    
    if (filtersChanged) {
      filtersRef.current = filters;
    }
  }, [filters.doctorId, filters.isApproved]);

  const fetchFeedbacks = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await feedbackService.getAllFeedbacks(filtersRef.current);
      if (mountedRef.current) {
        setFeedbacks(data || []);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load feedbacks');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchFeedbacks();
    
    return () => {
      mountedRef.current = false;
    };
  }, [filters.doctorId, filters.isApproved, fetchFeedbacks]);

  const createFeedback = async (feedbackData) => {
    try {
      const newFeedback = await feedbackService.createFeedback(feedbackData);
      setFeedbacks((prev) => [newFeedback, ...prev]);
      toast.success('Feedback submitted successfully');
      return newFeedback;
    } catch (err) {
      toast.error('Failed to submit feedback');
      throw err;
    }
  };

  const updateFeedback = async (id, feedbackData) => {
    try {
      const updated = await feedbackService.updateFeedback(id, feedbackData);
      setFeedbacks((prev) => prev.map((fb) => (fb.feedbackId === id ? updated : fb)));
      toast.success('Feedback updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update feedback');
      throw err;
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await feedbackService.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((fb) => fb.feedbackId !== id));
      toast.success('Feedback deleted successfully');
    } catch (err) {
      toast.error('Failed to delete feedback');
      throw err;
    }
  };

  const approveFeedback = async (id) => {
    try {
      await feedbackService.approveFeedback(id);
      await fetchFeedbacks();
      toast.success('Feedback approved successfully');
    } catch (err) {
      toast.error('Failed to approve feedback');
      throw err;
    }
  };

  const respondToFeedback = async (id, response) => {
    try {
      await feedbackService.respondToFeedback(id, response);
      await fetchFeedbacks();
      toast.success('Response added successfully');
    } catch (err) {
      toast.error('Failed to respond to feedback');
      throw err;
    }
  };

  return {
    feedbacks,
    loading,
    error,
    fetchFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    approveFeedback,
    respondToFeedback,
  };
};

export default useFeedback;

