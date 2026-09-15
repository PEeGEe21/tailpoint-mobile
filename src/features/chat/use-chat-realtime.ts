import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { environment } from '@/config/env';

interface RealtimeMessage {
  conversationId: string;
  message: unknown;
}

export function useChatRealtime({
  conversationId,
  userId,
  onMessage,
  onReadReceipt,
}: {
  conversationId: string;
  userId: number;
  onMessage: (event: RealtimeMessage) => void;
  onReadReceipt: () => void;
}) {
  const messageRef = useRef(onMessage);
  const receiptRef = useRef(onReadReceipt);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);

  useEffect(() => {
    messageRef.current = onMessage;
    receiptRef.current = onReadReceipt;
  }, [onMessage, onReadReceipt]);

  useEffect(() => {
    if (!conversationId || !userId) return;
    const socket = io(`${environment.apiUrl}/messages`, {
      transports: ['websocket'],
      reconnection: true,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('register_user', { userId });
      socket.emit('join_conversation', { conversationId });
    });
    socket.on('new_message', (event: RealtimeMessage) => {
      if (String(event.conversationId) === conversationId)
        messageRef.current(event);
    });
    socket.on(
      'user_typing',
      (event: {
        conversationId: string;
        userId: number;
        isTyping: boolean;
      }) => {
        if (
          String(event.conversationId) === conversationId &&
          Number(event.userId) !== userId
        )
          setTypingUserId(event.isTyping ? Number(event.userId) : null);
      },
    );
    socket.on('message_read_receipt', receiptRef.current);
    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, userId]);

  return {
    typingUserId,
    setTyping(isTyping: boolean) {
      socketRef.current?.emit(isTyping ? 'typing_start' : 'typing_stop', {
        conversationId,
      });
    },
  };
}
