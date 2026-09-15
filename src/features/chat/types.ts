export interface ChatPerson {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface Conversation {
  id: string;
  name: string;
  peer: ChatPerson | null;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
}

export interface ChatMessage {
  id: string;
  clientMessageId?: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: ChatPerson | null;
  senderId: number;
  isMine: boolean;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments: ChatAttachment[];
  reactions: { id: string; emoji: string; userId: number }[];
}

export interface ChatAttachment {
  fileUrl: string;
  localUri?: string;
  fileType: string | null;
  fileName: string;
  size: number | null;
}

export interface MessagePage {
  messages: ChatMessage[];
  pageInfo: {
    hasMore: boolean;
    oldestCursor: { id: string; createdAt: string } | null;
  };
}
