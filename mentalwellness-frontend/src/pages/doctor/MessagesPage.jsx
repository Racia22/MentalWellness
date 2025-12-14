import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Search, Phone, Video, MoreVertical, Check, CheckCheck, MessageCircle } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../contexts/AppContext';
import messageService from '../../api/services/messageService';
import patientService from '../../api/services/patientService';
import LoadingScreen from '../../components/common/Loading/LoadingScreen';
import { formatDate, formatTime } from '../../utils/formatters';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const DoctorMessagesPage = () => {
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useApp();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
      height: 'calc(100vh - 64px)',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    chatLayout: {
      display: 'flex',
      height: '100%',
      backgroundColor: '#FFFFFF',
    },
    sidebar: {
      width: '20rem',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
    },
    searchBar: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
    },
    searchWrapper: {
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6B7280',
      width: '1rem',
      height: '1rem',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.3s',
    },
    conversationsList: {
      flex: 1,
      overflowY: 'auto',
    },
    conversationItem: {
      padding: '1rem',
      cursor: 'pointer',
      borderBottom: '1px solid #f3f4f6',
      transition: 'all 0.2s',
    },
    conversationItemActive: {
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      borderLeft: '4px solid #1E40AF',
    },
    conversationContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    avatar: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1E40AF',
      fontWeight: '600',
      flexShrink: 0,
    },
    conversationInfo: {
      flex: 1,
      minWidth: 0,
    },
    conversationName: {
      fontWeight: '600',
      color: '#0A1D56',
      marginBottom: '0.25rem',
      fontSize: '0.875rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    conversationPreview: {
      fontSize: '0.75rem',
      color: '#6B7280',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    chatHeader: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chatHeaderInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    chatHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    iconButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      color: '#6B7280',
      transition: 'all 0.2s',
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#6B7280',
    },
    messageBubble: {
      maxWidth: '70%',
      padding: '0.75rem 1rem',
      borderRadius: '0.75rem',
      wordWrap: 'break-word',
    },
    messageSent: {
      alignSelf: 'flex-end',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      borderBottomRightRadius: '0.25rem',
    },
    messageReceived: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
      color: '#0A1D56',
      borderBottomLeftRadius: '0.25rem',
      border: '1px solid #e5e7eb',
    },
    messageText: {
      marginBottom: '0.25rem',
    },
    messageTime: {
      fontSize: '0.75rem',
      opacity: 0.7,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    fileAttachment: {
      marginBottom: '0.5rem',
    },
    fileLink: {
      color: 'inherit',
      textDecoration: 'underline',
      fontSize: '0.875rem',
    },
    messageInputArea: {
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem',
    },
    filePreview: {
      padding: '0.5rem 1rem',
      backgroundColor: '#F3F4F6',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    filePreviewText: {
      flex: 1,
      fontSize: '0.875rem',
      color: '#374151',
    },
    closeFileButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '1.25rem',
      padding: 0,
      width: '1.5rem',
      height: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '0.5rem',
    },
    attachButton: {
      padding: '0.75rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      color: '#6B7280',
      transition: 'all 0.2s',
    },
    textareaWrapper: {
      flex: 1,
      position: 'relative',
    },
    messageTextarea: {
      width: '100%',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      paddingRight: '3rem',
      fontSize: '0.875rem',
      resize: 'none',
      minHeight: '44px',
      maxHeight: '120px',
      transition: 'all 0.3s',
      fontFamily: 'inherit',
    },
    emojiButton: {
      position: 'absolute',
      right: '0.75rem',
      bottom: '0.75rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#6B7280',
      padding: '0.25rem',
    },
    sendButton: {
      padding: '0.75rem',
      backgroundColor: '#1E40AF',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  useEffect(() => {
    fetchPatients();
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchMessages(selectedPatient.userId || selectedPatient.patientId);
    }
  }, [selectedPatient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPatients = async () => {
    try {
      // Fetch patients who have messaged this doctor
      const data = await patientService.getAllPatients();
      setPatients(data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Fetch all messages for this doctor
      const allMessages = await messageService.getAllMessages({ recipientId: user?.userId });
      
      // Extract unique patients from conversations
      const uniquePatients = new Map();
      if (Array.isArray(allMessages)) {
        allMessages.forEach((msg) => {
          const patientId = msg.senderId || msg.sender?.userId;
          if (patientId && patientId !== user?.userId) {
            if (!uniquePatients.has(patientId)) {
              uniquePatients.set(patientId, {
                userId: patientId,
                fullName: msg.sender?.fullName || msg.senderName || 'Patient',
                lastMessage: msg.messageBody || msg.content,
                lastMessageTime: msg.sentAt || msg.createdAt,
              });
            }
          }
        });
      }
      
      setConversations(Array.from(uniquePatients.values()));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      handleError(error, 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (patientId) => {
    try {
      const data = await messageService.getMessages(user?.userId, patientId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      handleError(error, 'Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedPatient || (!messageText.trim() && !selectedFile)) return;

    setSending(true);
    try {
      const messageData = {
        senderId: user?.userId,
        recipientId: selectedPatient.userId || selectedPatient.patientId,
        messageBody: messageText.trim(),
        content: messageText.trim(), // Also include for compatibility
        attachmentUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
      };

      await messageService.sendMessage(messageData);
      setMessageText('');
      setSelectedFile(null);
      
      // Refresh messages
      await fetchMessages(selectedPatient.userId || selectedPatient.patientId);
      
      // Refresh conversations
      await fetchConversations();
      
      handleSuccess('Message sent');
    } catch (error) {
      handleError(error, 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        handleError(new Error('File size must be less than 10MB'), 'File too large');
        return;
      }
      setSelectedFile(file);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
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
          <div style={styles.chatLayout}>
            {/* Left Sidebar - Conversations */}
            <div style={styles.sidebar}>
              {/* Search Bar */}
              <div style={styles.searchBar}>
                <div style={styles.searchWrapper}>
                  <Search style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '2px solid #1E40AF';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '2px solid #e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div style={styles.conversationsList}>
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedPatient?.userId === conv.userId;
                    return (
                      <div
                        key={conv.userId}
                        onClick={() => setSelectedPatient(conv)}
                        style={{
                          ...styles.conversationItem,
                          ...(isSelected ? styles.conversationItemActive : {}),
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={styles.conversationContent}>
                          <div style={styles.avatar}>
                            {conv.fullName?.charAt(0) || 'P'}
                          </div>
                          <div style={styles.conversationInfo}>
                            <div style={styles.conversationName}>{conv.fullName}</div>
                            <div style={styles.conversationPreview}>
                              {conv.lastMessage || 'No messages yet'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div style={styles.chatArea}>
              {selectedPatient ? (
                <>
                  {/* Chat Header */}
                  <div style={styles.chatHeader}>
                    <div style={styles.chatHeaderInfo}>
                      <div style={styles.avatar}>
                        {selectedPatient.fullName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#0A1D56' }}>
                          {selectedPatient.fullName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Online</div>
                      </div>
                    </div>
                    <div style={styles.chatHeaderActions}>
                      <button
                        style={styles.iconButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Phone style={{ width: '1.25rem', height: '1.25rem' }} />
                      </button>
                      <button
                        style={styles.iconButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Video style={{ width: '1.25rem', height: '1.25rem' }} />
                      </button>
                      <button
                        style={styles.iconButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <MoreVertical style={{ width: '1.25rem', height: '1.25rem' }} />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div style={styles.messagesArea}>
                    {messages.length === 0 ? (
                      <div style={styles.emptyState}>
                        <MessageCircle style={{ width: '4rem', height: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                        <p style={{ margin: 0 }}>No messages yet</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                          Start a conversation with {selectedPatient.fullName}
                        </p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const isSent = msg.senderId === user?.userId;
                          const sentTime = new Date(msg.sentAt || msg.createdAt);
                          
                          return (
                            <div
                              key={msg.messageId || msg.id}
                              style={{
                                ...styles.messageBubble,
                                ...(isSent ? styles.messageSent : styles.messageReceived),
                              }}
                            >
                              {msg.attachmentUrl && (
                                <div style={styles.fileAttachment}>
                                  <a
                                    href={msg.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      ...styles.fileLink,
                                      color: isSent ? '#FFFFFF' : '#1E40AF',
                                    }}
                                  >
                                    📎 Attachment
                                  </a>
                                </div>
                              )}
                              <div style={styles.messageText}>
                                {msg.messageBody || msg.content}
                              </div>
                              <div style={styles.messageTime}>
                                <span>{formatTime(sentTime)}</span>
                                {isSent && (
                                  <span>
                                    {msg.isRead ? (
                                      <CheckCheck style={{ width: '0.75rem', height: '0.75rem' }} />
                                    ) : (
                                      <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* File Preview */}
                  {selectedFile && (
                    <div style={styles.filePreview}>
                      <Paperclip style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />
                      <span style={styles.filePreviewText}>{selectedFile.name}</span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        style={styles.closeFileButton}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} style={styles.messageInputArea}>
                    <div style={styles.inputGroup}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={styles.attachButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Paperclip style={{ width: '1.25rem', height: '1.25rem' }} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      
                      <div style={styles.textareaWrapper}>
                        <textarea
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                          }}
                          placeholder="Type a message..."
                          style={styles.messageTextarea}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = '2px solid #1E40AF';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = '2px solid #e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={sending || (!messageText.trim() && !selectedFile)}
                        style={{
                          ...styles.sendButton,
                          ...(sending || (!messageText.trim() && !selectedFile) ? styles.sendButtonDisabled : {}),
                        }}
                        onMouseEnter={(e) => {
                          if (!sending && (messageText.trim() || selectedFile)) {
                            e.currentTarget.style.backgroundColor = '#2563EB';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sending && (messageText.trim() || selectedFile)) {
                            e.currentTarget.style.backgroundColor = '#1E40AF';
                          }
                        }}
                      >
                        <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={styles.emptyState}>
                  <MessageCircle style={{ width: '4rem', height: '4rem', color: '#D1D5DB', marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontWeight: '500' }}>Select a patient to start chatting</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Choose from the list on the left to begin a conversation</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorMessagesPage;

