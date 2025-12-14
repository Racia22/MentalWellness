import axiosInstance from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';

export const messageService = {
  getAllMessages: async (filters = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.GET_ALL, { params: filters });
    // Ensure we return an array - axios interceptor already extracts .data
    return Array.isArray(response) ? response : (response?.data || []);
  },
  getMessageById: async (messageId) => await axiosInstance.get(API_ENDPOINTS.MESSAGES.GET_BY_ID(messageId)),
  getMessages: async (senderId, recipientId) => {
    // Get messages between two users - pass both as senderId and receiverId to get conversation
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.GET_ALL, { 
      params: { senderId, receiverId: recipientId } 
    });
    const messages = Array.isArray(response) ? response : (response?.data || []);
    // Sort by created date (oldest first for chat display)
    return messages.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.CreatedAt || 0);
      const dateB = new Date(b.createdAt || b.CreatedAt || 0);
      return dateA - dateB;
    });
  },
  getConversations: async (userId) => {
    // Get all messages where user is sender or receiver to build conversations
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.GET_ALL, {});
    const allMessages = Array.isArray(response) ? response : (response?.data || []);
    
    // Group by conversation partner - handle both camelCase and PascalCase
    const conversationsMap = new Map();
    allMessages.forEach(msg => {
      const msgSenderId = msg.senderId || msg.SenderId;
      const msgReceiverId = msg.receiverId || msg.ReceiverId;
      const msgReceiverName = msg.receiverName || msg.ReceiverName;
      const msgSenderName = msg.senderName || msg.SenderName;
      const msgMessageBody = msg.messageBody || msg.MessageBody;
      const msgCreatedAt = msg.createdAt || msg.CreatedAt;
      const msgIsRead = msg.isRead || msg.IsRead;
      
      const partnerId = msgSenderId === userId ? msgReceiverId : msgSenderId;
      const partnerName = msgSenderId === userId ? msgReceiverName : msgSenderName;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          name: partnerName,
          lastMessage: msgMessageBody,
          lastMessageTime: msgCreatedAt,
          unreadCount: 0
        });
      } else {
        const conv = conversationsMap.get(partnerId);
        if (new Date(msgCreatedAt) > new Date(conv.lastMessageTime)) {
          conv.lastMessage = msgMessageBody;
          conv.lastMessageTime = msgCreatedAt;
        }
        if (!msgIsRead && msgReceiverId === userId) {
          conv.unreadCount++;
        }
      }
    });
    
    return Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
  },
  sendMessage: async (messageData) => {
    // Map frontend data to backend DTO format
    // Backend gets senderId from JWT token, so we only send receiverId
    // Backend expects: ReceiverId, Subject, MessageBody (all required), and optional AppointmentId, Attachments, ParentMessageId
    const backendData = {
      receiverId: messageData.recipientId || messageData.receiverId,
      subject: messageData.subject || 'Message',
      messageBody: messageData.messageBody || messageData.content || '',
      appointmentId: messageData.appointmentId || null,
      attachments: messageData.attachments || (messageData.attachmentUrl ? JSON.stringify([messageData.attachmentUrl]) : null),
      parentMessageId: messageData.parentMessageId || null,
    };
    return await axiosInstance.post(API_ENDPOINTS.MESSAGES.SEND, backendData);
  },
  updateMessage: async (messageId, messageData) => await axiosInstance.put(API_ENDPOINTS.MESSAGES.UPDATE(messageId), messageData),
  deleteMessage: async (messageId) => await axiosInstance.delete(API_ENDPOINTS.MESSAGES.DELETE(messageId)),
};

export default messageService;

