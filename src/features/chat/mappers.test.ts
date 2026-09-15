import { mapConversation, mapMessage, mapMessagePage } from './mappers';

describe('chat mappers', () => {
  it('maps a direct conversation and snake-case preferences', () => {
    expect(
      mapConversation({
        id: 12,
        peer: { id: 7, first_name: 'Ada', last_name: 'Lovelace' },
        last_message: { content: 'Hello' },
        unread_count: 2,
        is_pinned: true,
      }),
    ).toMatchObject({
      id: '12',
      name: 'Ada Lovelace',
      lastMessage: 'Hello',
      unreadCount: 2,
      isPinned: true,
    });
  });

  it('identifies the current user messages and maps reactions', () => {
    expect(
      mapMessage(
        {
          id: 4,
          conversationId: 12,
          content: 'Done',
          senderId: 7,
          reactions: [{ id: 2, emoji: '👍', userId: 8 }],
        },
        7,
      ),
    ).toMatchObject({
      id: '4',
      conversationId: '12',
      isMine: true,
      deliveryStatus: 'sent',
      reactions: [{ id: '2', emoji: '👍', userId: 8 }],
      attachments: [],
    });
  });

  it('preserves snake-case client message ids for optimistic reconciliation', () => {
    expect(
      mapMessage({ id: 14, client_message_id: 'local-14', sender_id: 7 }, 7),
    ).toMatchObject({
      id: '14',
      clientMessageId: 'local-14',
      isMine: true,
    });
  });

  it('unwraps paginated API responses and preserves the cursor', () => {
    expect(
      mapMessagePage(
        {
          data: {
            messages: [{ id: 5, sender_id: 3, content: 'Earlier' }],
            pageInfo: {
              hasMore: true,
              oldestCursor: { id: 5, createdAt: '2026-09-13T10:00:00Z' },
            },
          },
        },
        9,
      ),
    ).toMatchObject({
      messages: [{ id: '5', isMine: false }],
      pageInfo: {
        hasMore: true,
        oldestCursor: { id: '5', createdAt: '2026-09-13T10:00:00Z' },
      },
    });
  });
});
