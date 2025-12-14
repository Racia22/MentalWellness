import React, { useState } from 'react';
import { Star, Calendar, MessageSquare, Plus, X } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useFeedback } from '../../hooks/useFeedback';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { formatDate } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const FeedbackPage = () => {
  const { user } = useAuth();
  const { feedbacks = [], loading, createFeedback } = useFeedback({});
  const { sidebarOpen, toggleSidebar } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: '',
    comment: '',
  });

  // Inline styles
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#6B7280',
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    formCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      marginBottom: '1.5rem',
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '1.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#0A1D56',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    textarea: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s',
      alignSelf: 'flex-end',
    },
    feedbacksList: {
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
      alignItems: 'center',
      marginBottom: '1rem',
    },
    ratingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#0A1D56',
    },
    feedbackDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    badge: {
      padding: '0.25rem 0.75rem',
      backgroundColor: '#D1FAE5',
      color: '#047857',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    feedbackComment: {
      color: '#6B7280',
      fontSize: '1rem',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    feedbackResponse: {
      padding: '1rem',
      backgroundColor: '#F3F4F6',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      color: '#374151',
      marginTop: '1rem',
    },
    responseLabel: {
      fontWeight: '600',
      color: '#0A1D56',
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFeedback({
        ...formData,
        patientId: user?.userId,
        rating: parseInt(formData.rating),
      });
      handleSuccess('Feedback submitted successfully');
      setShowForm(false);
      setFormData({ rating: '', comment: '' });
    } catch (error) {
      handleError(error, 'Failed to submit feedback');
    }
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

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>My Feedback</h1>
                <p style={styles.subtitle}>Share your experience and help us improve</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                style={styles.addButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
              >
                {showForm ? (
                  <>
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>

            {showForm && (
              <div style={styles.formCard}>
                <h3 style={styles.formTitle}>Submit Feedback</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rating</label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      style={styles.input}
                      onFocus={(e) => {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                    >
                      <option value="">Select Rating</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Comment</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows="4"
                      style={styles.textarea}
                      onFocus={(e) => {
                        e.currentTarget.style.border = '2px solid #1E40AF';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Share your feedback..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
                  >
                    Submit Feedback
                  </button>
                </form>
              </div>
            )}

            {feedbacks?.length === 0 ? (
              <EmptyState
                message="You haven't submitted any feedback yet. Share your experience to help us improve!"
                icon="💬"
              />
            ) : (
              <div style={styles.feedbacksList}>
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.feedbackId}
                    style={styles.feedbackCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.feedbackHeader}>
                      <div style={styles.ratingContainer}>
                        <span style={styles.rating}>
                          <Star style={{ width: '1.25rem', height: '1.25rem', fill: '#FBBF24', color: '#FBBF24' }} />
                          {feedback.rating}/5
                        </span>
                        <span style={styles.feedbackDate}>
                          <Calendar style={{ width: '1rem', height: '1rem' }} />
                          {formatDate(feedback.submittedAt)}
                        </span>
                      </div>
                      {feedback.isApproved && (
                        <span style={styles.badge}>Approved</span>
                      )}
                    </div>
                    <p style={styles.feedbackComment}>{feedback.comment}</p>
                    {feedback.response && (
                      <div style={styles.feedbackResponse}>
                        <span style={styles.responseLabel}>Response:</span> {feedback.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeedbackPage;
