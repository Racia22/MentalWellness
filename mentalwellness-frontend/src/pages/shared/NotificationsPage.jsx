import React from 'react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Card from '../../components/common/Card/Card';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/formatters';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Button from '../../components/common/Button/Button';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotificationContext();
  const { sidebarOpen, toggleSidebar } = useApp();

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
            {notifications.map((notification) => (
              <Card
                key={notification.notificationId}
                style={{
                  ...styles.notificationCard,
                  ...(!notification.isRead ? styles.notificationCardUnread : {}),
                }}
                onClick={() => !notification.isRead && markAsRead(notification.notificationId)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
              >
                <div>
                  <h3 style={styles.notificationTitle}>{notification.title}</h3>
                  <p style={styles.notificationMessage}>{notification.message}</p>
                  <p style={styles.notificationDate}>{formatDate(notification.createdAt)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;

