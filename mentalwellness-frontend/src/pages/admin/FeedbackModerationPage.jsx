import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, CheckCircle, X, Star, User, Calendar, Clock } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import axiosInstance from '../../api/axios.config';
import toast from 'react-hot-toast';

const AdminFeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, approved, all
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/feedback';
      if (filter === 'pending') {
        url += '?isApproved=false';
      } else if (filter === 'approved') {
        url += '?isApproved=true';
      }
      
      const response = await axiosInstance.get(url);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setFeedbacks(data);
    } catch (error) {
      handleError(error, 'Failed to load feedbacks');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleApprove = async (feedbackId) => {
    try {
      await axiosInstance.post(`/api/feedback/${feedbackId}/approve`);
      handleSuccess('Feedback approved successfully');
      fetchFeedbacks();
    } catch (error) {
      handleError(error, 'Failed to approve feedback');
    }
  };

  const handleReject = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to reject this feedback? This action cannot be undone.')) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/feedback/${feedbackId}`);
      handleSuccess('Feedback rejected successfully');
      fetchFeedbacks();
    } catch (error) {
      handleError(error, 'Failed to reject feedback');
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      backgroundColor: '#F5F5F0',
      display: 'flex',
      flexDirection: 'column',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
    },
    main: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: '#F5F5F0',
    },
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#0A1D56',
    },
    subtitle: {
      color: '#6B7280',
      marginBottom: '1.5rem',
    },
    filterTabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: '2px solid #e5e7eb',
    },
    filterTab: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6B7280',
      transition: 'all 0.3s',
    },
    filterTabActive: {
      color: '#1E40AF',
      borderBottomColor: '#1E40AF',
    },
    feedbackList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    feedbackCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
    },
    feedbackHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    ratingStars: {
      display: 'flex',
      gap: '0.25rem',
      color: '#FBBF24',
    },
    ratingNumber: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#0A1D56',
    },
    feedbackMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    badgeAnonymous: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    badgeApproved: {
      backgroundColor: '#D1FAE5',
      color: '#047857',
    },
    feedbackTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.75rem',
    },
    feedbackText: {
      color: '#374151',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    feedbackDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    detailLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontWeight: '500',
    },
    detailValue: {
      fontSize: '0.875rem',
      color: '#0A1D56',
      fontWeight: '600',
    },
    feedbackActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },
    buttonApprove: {
      backgroundColor: '#10b981',
      color: '#FFFFFF',
    },
    buttonReject: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
    },
    doctorResponse: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#F0FDF4',
      border: '1px solid #10b981',
      borderRadius: '0.5rem',
    },
    doctorResponseTitle: {
      fontWeight: '600',
      color: '#047857',
      marginBottom: '0.5rem',
    },
    doctorResponseText: {
      color: '#065f46',
      lineHeight: '1.6',
      marginBottom: '0.5rem',
    },
    doctorResponseDate: {
      fontSize: '0.75rem',
      color: '#6B7280',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === 'pending') return !f.isApproved;
    if (filter === 'approved') return f.isApproved;
    return true;
  });

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>Feedback Moderation</h1>
              <p style={styles.subtitle}>Review and manage patient feedback for doctors</p>
            </div>

            {/* Filter Tabs */}
            <div style={styles.filterTabs}>
              <button
                onClick={() => setFilter('pending')}
                style={{
                  ...styles.filterTab,
                  ...(filter === 'pending' ? styles.filterTabActive : {}),
                }}
              >
                Pending Review ({feedbacks.filter(f => !f.isApproved).length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                style={{
                  ...styles.filterTab,
                  ...(filter === 'approved' ? styles.filterTabActive : {}),
                }}
              >
                Approved ({feedbacks.filter(f => f.isApproved).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                style={{
                  ...styles.filterTab,
                  ...(filter === 'all' ? styles.filterTabActive : {}),
                }}
              >
                All Feedback ({feedbacks.length})
              </button>
            </div>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
              <EmptyState
                message={
                  filter === 'pending'
                    ? 'No pending feedback to review'
                    : filter === 'approved'
                    ? 'No approved feedback yet'
                    : 'No feedback found'
                }
                icon="💬"
              />
            ) : (
              <div style={styles.feedbackList}>
                {filteredFeedbacks.map((feedback) => {
                  const feedbackId = feedback.feedbackId || feedback.FeedbackId;
                  const rating = feedback.rating || feedback.Rating || 0;
                  const isApproved = feedback.isApproved || feedback.IsApproved;
                  const isAnonymous = feedback.isAnonymous || feedback.IsAnonymous;

                  return (
                    <div key={feedbackId} style={styles.feedbackCard}>
                      <div style={styles.feedbackHeader}>
                        <div style={styles.rating}>
                          <div style={styles.ratingStars}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                style={{
                                  width: '1.25rem',
                                  height: '1.25rem',
                                  fill: i < rating ? '#FBBF24' : '#E5E7EB',
                                  color: i < rating ? '#FBBF24' : '#E5E7EB',
                                }}
                              />
                            ))}
                          </div>
                          <span style={styles.ratingNumber}>{rating}/5</span>
                        </div>
                        <div style={styles.feedbackMeta}>
                          <span>{formatDate(feedback.createdAt || feedback.CreatedAt)}</span>
                          {isAnonymous && (
                            <span style={{ ...styles.badge, ...styles.badgeAnonymous }}>
                              Anonymous
                            </span>
                          )}
                          {isApproved && (
                            <span style={{ ...styles.badge, ...styles.badgeApproved }}>
                              ✓ Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 style={styles.feedbackTitle}>
                        {feedback.reviewTitle || feedback.ReviewTitle || 'No title'}
                      </h3>
                      <p style={styles.feedbackText}>
                        {feedback.reviewText || feedback.ReviewText || 'No review text provided'}
                      </p>

                      <div style={styles.feedbackDetails}>
                        <div style={styles.detailItem}>
                          <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                          <span style={styles.detailLabel}>Patient:</span>
                          <span style={styles.detailValue}>
                            {feedback.patientName || feedback.PatientName || 'N/A'}
                          </span>
                        </div>
                        <div style={styles.detailItem}>
                          <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                          <span style={styles.detailLabel}>Doctor:</span>
                          <span style={styles.detailValue}>
                            {feedback.doctorName || feedback.DoctorName || 'N/A'}
                          </span>
                        </div>
                        {(feedback.appointmentId || feedback.AppointmentId) && (
                          <div style={styles.detailItem}>
                            <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                            <span style={styles.detailLabel}>Appointment:</span>
                            <span style={styles.detailValue}>Linked</span>
                          </div>
                        )}
                      </div>

                      {feedback.doctorResponse || feedback.DoctorResponse ? (
                        <div style={styles.doctorResponse}>
                          <div style={styles.doctorResponseTitle}>Doctor's Response:</div>
                          <p style={styles.doctorResponseText}>
                            {feedback.doctorResponse || feedback.DoctorResponse}
                          </p>
                          {feedback.respondedAt || feedback.RespondedAt && (
                            <div style={styles.doctorResponseDate}>
                              Responded on {formatDate(feedback.respondedAt || feedback.RespondedAt)}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {!isApproved && (
                        <div style={styles.feedbackActions}>
                          <button
                            onClick={() => handleApprove(feedbackId)}
                            style={{ ...styles.button, ...styles.buttonApprove }}
                          >
                            <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(feedbackId)}
                            style={{ ...styles.button, ...styles.buttonReject }}
                          >
                            <X style={{ width: '1rem', height: '1rem' }} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
