import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Card from '../../components/common/Card/Card';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/formatters';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Button from '../../components/common/Button/Button';
import { 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  UserCheck, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, fetchNotifications } = useNotificationContext();
  const { sidebarOpen, toggleSidebar } = useApp();
  const navigate = useNavigate();

  // Refresh notifications when page loads
  React.useEffect(() => {
    console.log('NotificationsPage: Fetching notifications...');
    if (fetchNotifications) {
      fetchNotifications();
    }
  }, [fetchNotifications]);
  
  // Debug: Log notifications state
  React.useEffect(() => {
    console.log('NotificationsPage: notifications =', notifications);
    console.log('NotificationsPage: loading =', loading);
    console.log('NotificationsPage: notifications.length =', notifications?.length || 0);
  }, [notifications, loading]);

  const getNotificationIcon = (notificationType, entityType) => {
    // Use EntityType to determine icon since NotificationType is now "InApp" for all
    switch (entityType) {
      case 'Message':
        return <MessageSquare style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />;
      case 'Appointment':
        return <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />;
      case 'Payment':
        return <CreditCard style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />;
      case 'Doctor':
        return <UserCheck style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6' }} />;
      default:
        return <Info style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const handleNotificationClick = async (notification) => {
    const notificationId = notification.notificationId || notification.NotificationId;
    const isRead = notification.isRead || notification.IsRead;
    const actionUrl = notification.actionUrl || notification.ActionUrl;

    // Mark as read if unread
    if (!isRead && notificationId) {
      try {
        await markAsRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to action URL if available
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    pageHeaderH1: {
      fontSize: '2rem',
      fontWeight: 700,
      margin: 0,
      color: '#1f2937',
    },
    notificationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    notificationCard: {
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    notificationCardUnread: {
      backgroundColor: '#eff6ff',
      borderLeft: '4px solid #3b82f6',
    },
    notificationTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      margin: '0 0 0.5rem 0',
      color: '#1f2937',
    },
    notificationMessage: {
      color: '#6b7280',
      margin: '0 0 0.5rem 0',
      lineHeight: 1.6,
    },
    notificationDate: {
      color: '#9ca3af',
      fontSize: '0.875rem',
      margin: 0,
    },
  };

  const layoutStyles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      backgroundColor: '#f9fafb',
    },
    body: {
      display: 'flex',
      flex: 1,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
    main: {
      flex: 1,
      padding: '2rem',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(100vh - 4rem)',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'margin-left 0.3s ease',
    },
  };

  if (loading) {
    return (
      <div style={layoutStyles.layout}>
        <Header />
        <div style={layoutStyles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={layoutStyles.main}>
            <LoadingScreen />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyles.layout}>
      <Header />
      <div style={layoutStyles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
        <main style={layoutStyles.main}>
          <div style={styles.page}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageHeaderH1}>Notifications</h1>
          {notifications.length > 0 && (
            <Button onClick={markAllAsRead}>Mark All as Read</Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="No Notifications"
            message="You don't have any notifications yet."
          />
        ) : (
          <div style={styles.notificationsList}>
            {notifications.map((notification) => {
              const notificationId = notification.notificationId || notification.NotificationId;
              const isRead = notification.isRead || notification.IsRead;
              const title = notification.title || notification.Title;
              const message = notification.message || notification.Message;
              const createdAt = notification.createdAt || notification.CreatedAt;
              const notificationType = notification.notificationType || notification.NotificationType;
              const entityType = notification.entityType || notification.EntityType;
              const priority = notification.priority || notification.Priority;
              const actionUrl = notification.actionUrl || notification.ActionUrl;

              return (
                <Card
                  key={notificationId}
                  style={{
                    ...styles.notificationCard,
                    ...(!isRead ? styles.notificationCardUnread : {}),
                    borderLeftColor: getPriorityColor(priority),
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '0.25rem' }}>
                      {getNotificationIcon(notificationType, entityType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={styles.notificationTitle}>{title}</h3>
                        {!isRead && (
                          <span style={{
                            width: '0.5rem',
                            height: '0.5rem',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            marginTop: '0.5rem'
                          }} />
                        )}
                      </div>
                      <p style={styles.notificationMessage}>{message}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <p style={styles.notificationDate}>{formatDate(createdAt)}</p>
                        {actionUrl && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#3b82f6',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}>
                            View →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
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

export default NotificationsPage;

