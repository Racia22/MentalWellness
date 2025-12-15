import { useState, useEffect, useCallback } from 'react';
import messageService from '../api/services/messageService';
import toast from 'react-hot-toast';

export const useMessages = (filters = {}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await messageService.getAllMessages(filters);
      setMessages(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (messageData) => {
    try {
      const newMessage = await messageService.sendMessage(messageData);
      setMessages((prev) => [newMessage, ...prev]);
      toast.success('Message sent successfully');
      return newMessage;
    } catch (err) {
      toast.error('Failed to send message');
      throw err;
    }
  };

  const updateMessage = async (id, messageData) => {
    try {
      const updated = await messageService.updateMessage(id, messageData);
      setMessages((prev) => prev.map((msg) => (msg.messageId === id ? updated : msg)));
      toast.success('Message updated successfully');
      return updated;
    } catch (err) {
      toast.error('Failed to update message');
      throw err;
    }
  };

  const deleteMessage = async (id) => {
    try {
      await messageService.deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.messageId !== id));
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Failed to delete message');
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};

export default useMessages;

