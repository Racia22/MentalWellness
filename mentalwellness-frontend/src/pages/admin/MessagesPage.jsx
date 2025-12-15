import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, User, Calendar, Eye } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useApp } from '../../contexts/AppContext';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import messageService from '../../api/services/messageService';
import { handleError } from '../../utils/errorHandler';
import { formatDate, formatTime } from '../../utils/formatters';
import axiosInstance from '../../api/axios.config';
import { API_ENDPOINTS } from '../../api/endpoints';

const AdminMessagesPage = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { sidebarOpen, toggleSidebar } = useApp();

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      // Use admin endpoint to get all messages
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.MESSAGES);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setMessages(data);
    } catch (error) {
      handleError(error, 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = messages.filter(message => {
    const senderName = message.senderName || message.SenderName || '';
    const recipientName = message.recipientName || message.RecipientName || '';
    const content = (message.messageBody || message.MessageBody || message.content || '').substring(0, 100);
    
    return !searchTerm || 
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const styles = {
    page: { minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: '#F5F5F0', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1, width: '100%' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#F5F5F0' },
    container: { maxWidth: '1280px', margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0A1D56' },
    subtitle: { color: '#6B7280', marginBottom: '1.5rem' },
    warningNote: { backgroundColor: '#DBEAFE', border: '1px solid #3B82F6', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', color: '#1E40AF', fontSize: '0.875rem' },
    controls: { marginBottom: '1.5rem' },
    searchBox: { position: 'relative', maxWidth: '500px' },
    searchInput: { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #D1D5DB', borderRadius: '0.5rem', fontSize: '0.875rem' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', width: '1rem', height: '1rem' },
    messagesTable: { backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontWeight: '600', fontSize: '0.875rem', color: '#374151' },
    tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s' },
    tableCell: { fontSize: '0.875rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    messagePreview: { maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6B7280' },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.body}>
          <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />
          <main style={styles.main}><LoadingScreen /></main>
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
              <h1 style={styles.title}>Messages Log</h1>
              <p style={styles.subtitle}>Monitor message activity in the system</p>
            </div>

            <div style={styles.warningNote}>
              <strong>ℹ️ Privacy Notice:</strong> This page shows message metadata for system monitoring and safety purposes. Full message content may be truncated for privacy.
            </div>

            <div style={styles.controls}>
              <div style={styles.searchBox}>
                <Search style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by sender, recipient, or message content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <EmptyState
                message={messages.length === 0 ? "No messages found." : "No messages match your search criteria."}
                icon="💬"
              />
            ) : (
              <div style={styles.messagesTable}>
                <div style={styles.tableHeader}>
                  <div>Sender</div>
                  <div>Recipient</div>
                  <div>Message Preview</div>
                  <div>Date</div>
                  <div>Time</div>
                </div>
                {filteredMessages.map((message) => {
                  const sentAt = message.sentAt || message.SentAt || message.createdAt || message.CreatedAt;
                  const dateObj = sentAt ? new Date(sentAt) : null;
                  return (
                    <div 
                      key={message.messageId || message.MessageId} 
                      style={styles.tableRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      <div style={styles.tableCell}>
                        <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {message.senderName || message.SenderName || 'Unknown'}
                      </div>
                      <div style={styles.tableCell}>
                        <User style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {message.recipientName || message.RecipientName || 'Unknown'}
                      </div>
                      <div style={{ ...styles.tableCell, ...styles.messagePreview }}>
                        <MessageSquare style={{ width: '1rem', height: '1rem', color: '#6B7280', flexShrink: 0 }} />
                        {(message.messageBody || message.MessageBody || message.content || 'No content').substring(0, 80)}
                        {((message.messageBody || message.MessageBody || message.content || '').length > 80) ? '...' : ''}
                      </div>
                      <div style={styles.tableCell}>
                        <Calendar style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                        {dateObj ? formatDate(dateObj) : 'N/A'}
                      </div>
                      <div style={styles.tableCell}>
                        {dateObj ? formatTime(dateObj) : 'N/A'}
                      </div>
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

export default AdminMessagesPage;

