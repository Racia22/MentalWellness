import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (options.onOpen) options.onOpen();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (options.onMessage) options.onMessage(data);
      };

      ws.onerror = (error) => {
        if (options.onError) options.onError(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (options.onClose) options.onClose();

        if (options.reconnect !== false) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, options.reconnectDelay || 3000);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
};

export default useWebSocket;

