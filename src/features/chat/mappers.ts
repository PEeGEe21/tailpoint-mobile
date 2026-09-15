import type {
  ChatMessage,
  ChatPerson,
  Conversation,
  MessagePage,
} from './types';

type Row = Record<string, unknown>;
const row = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};

const person = (value: unknown): ChatPerson | null => {
  const data = row(value);
  if (!data.id) return null;
  const name =
    String(data.fullName ?? data.name ?? '').trim() ||
    `${String(data.first_name ?? '')} ${String(data.last_name ?? '')}`.trim() ||
    String(data.email ?? 'Member');
  return {
    id: Number(data.id),
    name,
    avatar: typeof data.avatar === 'string' ? data.avatar : null,
  };
};

export const mapConversation = (value: unknown): Conversation => {
  const data = row(value);
  const last = row(data.lastMessage ?? data.last_message);
  const peer = person(data.peer);
  return {
    id: String(data.id),
    name: String(data.name ?? peer?.name ?? 'Conversation'),
    peer,
    lastMessage: String(last.content ?? data.lastMessageContent ?? ''),
    lastMessageAt:
      typeof (last.createdAt ?? data.updatedAt) === 'string'
        ? String(last.createdAt ?? data.updatedAt)
        : null,
    unreadCount: Number(data.unreadCount ?? data.unread_count ?? 0),
    isPinned: Boolean(data.isPinned ?? data.is_pinned),
    isArchived: Boolean(data.isArchived ?? data.is_archived),
  };
};

export const mapMessage = (value: unknown, userId: number): ChatMessage => {
  const data = row(value);
  const sender = person(data.sender);
  const senderId = Number(data.senderId ?? data.sender_id ?? sender?.id ?? 0);
  const status = String(data.deliveryStatus ?? data.status ?? 'sent');
  return {
    id: String(data.id),
    clientMessageId:
      typeof (data.clientMessageId ?? data.client_message_id) === 'string'
        ? String(data.clientMessageId ?? data.client_message_id)
        : undefined,
    conversationId: String(data.conversationId ?? data.conversation_id ?? ''),
    content: String(data.content ?? ''),
    createdAt: String(
      data.createdAt ?? data.created_at ?? new Date(0).toISOString(),
    ),
    sender,
    senderId,
    isMine: senderId === userId,
    deliveryStatus: ['pending', 'sent', 'delivered', 'read', 'failed'].includes(
      status,
    )
      ? (status as ChatMessage['deliveryStatus'])
      : 'sent',
    attachments: (Array.isArray(data.attachments) ? data.attachments : []).map(
      (value) => {
        const attachment = row(value);
        return {
          fileUrl: String(attachment.fileUrl ?? attachment.file_url ?? ''),
          fileType:
            typeof (attachment.fileType ?? attachment.file_type) === 'string'
              ? String(attachment.fileType ?? attachment.file_type)
              : null,
          fileName: String(
            attachment.fileName ?? attachment.file_name ?? 'Attachment',
          ),
          size: Number.isFinite(
            Number(
              attachment.size ?? attachment.fileSize ?? attachment.file_size,
            ),
          )
            ? Number(
                attachment.size ?? attachment.fileSize ?? attachment.file_size,
              )
            : null,
        };
      },
    ),
    reactions: (Array.isArray(data.reactions) ? data.reactions : []).map(
      (value) => {
        const reaction = row(value);
        return {
          id: String(reaction.id),
          emoji: String(reaction.emoji),
          userId: Number(reaction.userId ?? reaction.user_id),
        };
      },
    ),
  };
};

export const mapMessagePage = (value: unknown, userId: number): MessagePage => {
  const payload = row(value);
  const data = row(payload.data ?? payload);
  const pageInfo = row(data.pageInfo);
  const cursor = row(pageInfo.oldestCursor);
  return {
    messages: (Array.isArray(data.messages) ? data.messages : []).map(
      (message) => mapMessage(message, userId),
    ),
    pageInfo: {
      hasMore: Boolean(pageInfo.hasMore),
      oldestCursor: cursor.id
        ? { id: String(cursor.id), createdAt: String(cursor.createdAt) }
        : null,
    },
  };
};
