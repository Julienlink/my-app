'use client';

import { useEffect, useState } from 'react';
import { wsClient } from '../client';
import { WebSocketMessage } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    wsClient
      .connect()
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        console.error('Erreur de connexion WebSocket:', err);
        setError(err.message);
      });

    const unsubscribe = wsClient.subscribe('message', (message: WebSocketMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendMessage = (data: any) => {
    if (!isConnected) {
      setError('WebSocket non connecté');
      return;
    }
    wsClient.send(data);
  };

  const disconnect = () => {
    wsClient.disconnect();
    setIsConnected(false);
  };

  return {
    isConnected,
    messages,
    error,
    sendMessage,
    disconnect,
  };
}
