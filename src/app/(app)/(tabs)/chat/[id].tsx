import { MaterialIcons } from '@expo/vector-icons';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { queryKeys } from '@/api/query-keys';
import { useSessionStore } from '@/auth/session-store';
import { FeedbackState } from '@/components/feedback-state';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet, Toast } from '@/components/ui/overlays';
import { Radius, Spacing } from '@/constants/theme';
import { environment } from '@/config/env';
import {
  addReaction,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessage,
  uploadAttachment,
} from '@/features/chat/chat-api';
import {
  mapConversation,
  mapMessage,
  mapMessagePage,
} from '@/features/chat/mappers';
import type { ChatAttachment, ChatMessage } from '@/features/chat/types';
import { useChatRealtime } from '@/features/chat/use-chat-realtime';
import { useTheme } from '@/hooks/use-theme';

const REACTIONS = ['👍', '❤️', '🎉', '😂', '👀'];
const isImageAttachment = (file: ChatAttachment) =>
  file.fileType?.startsWith('image/') ||
  /\.(avif|gif|heic|heif|jpe?g|png|webp)$/i.test(file.fileName);

export default function ChatThreadScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id);
  const organizationId = useSessionStore((state) => state.organizationId);
  const userId = useSessionStore((state) => state.user?.id ?? 0);
  const accessToken = useSessionStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [composer, setComposer] = useState('');
  const [composerSelection, setComposerSelection] = useState({
    start: 0,
    end: 0,
  });
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const shouldScrollToEnd = useRef(true);
  const [pending, setPending] = useState<ChatMessage[]>([]);
  const [reactionMessage, setReactionMessage] = useState<ChatMessage | null>(
    null,
  );
  const conversationsQuery = useQuery({
    queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
    queryFn: fetchConversations,
    enabled: Boolean(organizationId),
  });
  const conversation = (
    Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []
  )
    .map(mapConversation)
    .find((item) => item.id === conversationId);
  const messagesQuery = useInfiniteQuery({
    queryKey: queryKeys.chat.messages(organizationId ?? 'none', conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    initialPageParam: null as { id: string; createdAt: string } | null,
    getNextPageParam: (lastPage) => {
      const page = mapMessagePage(lastPage, userId);
      return page.pageInfo.hasMore ? page.pageInfo.oldestCursor : undefined;
    },
    enabled: Boolean(organizationId && conversationId),
    refetchInterval: 8_000,
  });
  const serverMessages = useMemo(
    () =>
      (messagesQuery.data?.pages ?? [])
        .flatMap((page) => mapMessagePage(page, userId).messages)
        .filter(
          (message, index, all) =>
            all.findIndex((candidate) => candidate.id === message.id) === index,
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [messagesQuery.data?.pages, userId],
  );
  const messages = [
    ...serverMessages,
    ...pending.filter(
      (item) =>
        !serverMessages.some(
          (saved) =>
            saved.id === item.id ||
            (item.clientMessageId &&
              saved.clientMessageId === item.clientMessageId),
        ),
    ),
  ];
  const sendMutation = useMutation({
    mutationFn: ({
      content,
      clientMessageId,
      attachments,
    }: {
      content: string;
      clientMessageId: string;
      attachments: ChatAttachment[];
    }) => sendMessage(conversationId, content, clientMessageId, attachments),
    onSuccess: async (value, variables) => {
      const savedMessage = mapMessage(value, userId);
      setPending((items) =>
        items.map((item) =>
          item.clientMessageId === variables.clientMessageId
            ? {
                ...savedMessage,
                clientMessageId:
                  savedMessage.clientMessageId ?? variables.clientMessageId,
                isMine: true,
                deliveryStatus: 'sent',
              }
            : item,
        ),
      );
      const [refreshedMessages] = await Promise.all([
        messagesQuery.refetch(),
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
        }),
      ]);
      const savedClientIds = new Set(
        (refreshedMessages.data?.pages ?? [])
          .flatMap((page) => mapMessagePage(page, userId).messages)
          .flatMap((message) =>
            message.clientMessageId ? [message.clientMessageId] : [],
          ),
      );
      setPending((items) =>
        items.filter(
          (item) =>
            !item.clientMessageId || !savedClientIds.has(item.clientMessageId),
        ),
      );
    },
    onError: (_error, variables) => {
      setPending((items) =>
        items.map((item) =>
          item.clientMessageId === variables.clientMessageId
            ? { ...item, deliveryStatus: 'failed' }
            : item,
        ),
      );
    },
  });

  const reactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction(messageId, emoji),
    onSuccess: async () => {
      setReactionMessage(null);
      await messagesQuery.refetch();
    },
  });
  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,
    onMutate: () => setAttachmentError(null),
    onSuccess: (value) => {
      setAttachment(value);
      setAttachmentError(null);
    },
    onError: (error) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Attachment could not be uploaded.';
      setAttachmentError(message);
    },
  });

  const handleRealtimeMessage = useCallback(() => {
    shouldScrollToEnd.current = true;
    void messagesQuery.refetch();
    void queryClient.invalidateQueries({
      queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
    });
  }, [messagesQuery, organizationId, queryClient]);
  const handleReadReceipt = useCallback(() => {
    void messagesQuery.refetch();
  }, [messagesQuery]);
  const realtime = useChatRealtime({
    conversationId,
    userId,
    onMessage: handleRealtimeMessage,
    onReadReceipt: handleReadReceipt,
  });

  useEffect(() => {
    const latestIncoming = [...serverMessages]
      .reverse()
      .find((message) => !message.isMine);
    if (latestIncoming)
      void markConversationRead(conversationId, latestIncoming.id).then(() =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
        }),
      );
  }, [conversationId, organizationId, queryClient, serverMessages]);

  const submit = () => {
    const content = composer.trim();
    if ((!content && !attachment) || sendMutation.isPending) return;
    const clientMessageId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPending((items) => [
      ...items,
      {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        content,
        createdAt: new Date().toISOString(),
        sender: null,
        senderId: userId,
        isMine: true,
        deliveryStatus: 'pending',
        attachments: attachment ? [attachment] : [],
        reactions: [],
      },
    ]);
    setComposer('');
    setComposerSelection({ start: 0, end: 0 });
    setAttachment(null);
    realtime.setTyping(false);
    shouldScrollToEnd.current = true;
    sendMutation.mutate({
      content,
      clientMessageId,
      attachments: attachment ? [attachment] : [],
    });
  };

  const retry = (message: ChatMessage) => {
    if (message.deliveryStatus !== 'failed' || !message.clientMessageId) return;
    setPending((items) =>
      items.map((item) =>
        item.clientMessageId === message.clientMessageId
          ? { ...item, deliveryStatus: 'pending' }
          : item,
      ),
    );
    sendMutation.mutate({
      content: message.content,
      clientMessageId: message.clientMessageId,
      attachments: message.attachments,
    });
  };

  const pickAttachment = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: '*/*',
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (file.size && file.size > 10 * 1024 * 1024) {
      setAttachmentError('Attachments must be 10 MB or smaller.');
      return;
    }
    uploadMutation.mutate({
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType,
    });
  };

  const pickEmoji = (emoji: EmojiType) => {
    const start = Math.min(composerSelection.start, composer.length);
    const end = Math.min(composerSelection.end, composer.length);
    const nextValue = `${composer.slice(0, start)}${emoji.emoji}${composer.slice(end)}`;
    const nextCursor = start + emoji.emoji.length;
    setComposer(nextValue);
    setComposerSelection({ start: nextCursor, end: nextCursor });
    realtime.setTyping(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            accessibilityLabel="Back to conversations"
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <MaterialIcons color={theme.text} name="arrow-back" size={24} />
          </Pressable>
          <View style={styles.grow}>
            <ThemedText numberOfLines={1} style={styles.headerTitle}>
              {conversation?.name ?? 'Conversation'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {realtime.typingUserId ? 'Typing…' : 'Workspace chat'}
            </ThemedText>
          </View>
        </View>
        {messagesQuery.isPending ? (
          <FeedbackState
            description="Loading conversation history."
            title="Loading messages"
            variant="loading"
          />
        ) : messagesQuery.isError ? (
          <FeedbackState
            actionLabel="Try again"
            description="Messages could not be loaded."
            onAction={() => void messagesQuery.refetch()}
            title="Unable to load messages"
            variant="error"
          />
        ) : (
          <FlatList
            ref={listRef}
            contentContainerStyle={styles.messages}
            data={messages}
            keyExtractor={(item) => `${item.id}-${item.clientMessageId ?? ''}`}
            ListHeaderComponent={
              messagesQuery.hasNextPage ? (
                <Pressable
                  onPress={() => void messagesQuery.fetchNextPage()}
                  style={styles.olderButton}
                >
                  <ThemedText type="smallBold">
                    {messagesQuery.isFetchingNextPage
                      ? 'Loading...'
                      : 'Load older messages'}
                  </ThemedText>
                </Pressable>
              ) : null
            }
            ListEmptyComponent={
              <FeedbackState
                description="Send the first message in this conversation."
                title="No messages yet"
                variant="empty"
              />
            }
            onContentSizeChange={() => {
              if (!shouldScrollToEnd.current) return;
              listRef.current?.scrollToEnd({ animated: false });
              shouldScrollToEnd.current = false;
            }}
            renderItem={({ item }) => (
              <Pressable
                accessibilityHint={
                  item.deliveryStatus === 'failed'
                    ? 'Retries sending this message'
                    : 'Opens message reactions'
                }
                onPress={() => retry(item)}
                onLongPress={() => setReactionMessage(item)}
                style={[
                  styles.bubble,
                  item.isMine ? styles.mine : styles.theirs,
                  {
                    backgroundColor: item.isMine
                      ? theme.primary
                      : theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}
              >
                {item.content ? (
                  <ThemedText style={item.isMine ? styles.mineText : undefined}>
                    {item.content}
                  </ThemedText>
                ) : null}
                {item.attachments.map((file) =>
                  isImageAttachment(file) ? (
                    <Image
                      accessibilityLabel={file.fileName}
                      contentFit="cover"
                      key={file.fileUrl}
                      source={
                        file.localUri
                          ? { uri: file.localUri }
                          : {
                              uri: `${environment.apiUrl}/api/messages/${encodeURIComponent(item.id)}/attachment`,
                              headers: {
                                Authorization: `Bearer ${accessToken ?? ''}`,
                                'x-organization-id': organizationId ?? '',
                              },
                            }
                      }
                      style={styles.attachmentImage}
                      transition={150}
                    />
                  ) : (
                    <Pressable
                      key={file.fileUrl}
                      onPress={() => void Linking.openURL(file.fileUrl)}
                      style={styles.attachment}
                    >
                      <MaterialIcons
                        color={item.isMine ? '#FFFFFF' : theme.primary}
                        name="attach-file"
                        size={17}
                      />
                      <ThemedText
                        numberOfLines={1}
                        style={item.isMine ? styles.mineText : undefined}
                      >
                        {file.fileName}
                      </ThemedText>
                    </Pressable>
                  ),
                )}
                <ThemedText
                  style={[styles.time, item.isMine && styles.mineMeta]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {item.isMine ? ` · ${item.deliveryStatus}` : ''}
                </ThemedText>
                {item.deliveryStatus === 'failed' ? (
                  <ThemedText style={styles.retry}>Tap to retry</ThemedText>
                ) : null}
                {item.reactions.length ? (
                  <ThemedText style={styles.reactions}>
                    {item.reactions.map((reaction) => reaction.emoji).join(' ')}
                  </ThemedText>
                ) : null}
              </Pressable>
            )}
          />
        )}
        <View
          style={[
            styles.composer,
            {
              borderTopColor: theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        >
          {attachment ? (
            <View style={[styles.selectedFile, { borderColor: theme.border }]}>
              <MaterialIcons
                color={theme.primary}
                name="attach-file"
                size={18}
              />
              <ThemedText numberOfLines={1} style={styles.grow} type="small">
                {attachment.fileName}
              </ThemedText>
              <Pressable
                accessibilityLabel="Remove attachment"
                onPress={() => setAttachment(null)}
              >
                <MaterialIcons
                  color={theme.textSecondary}
                  name="close"
                  size={20}
                />
              </Pressable>
            </View>
          ) : null}
          <Pressable
            accessibilityLabel="Attach a file"
            disabled={uploadMutation.isPending}
            onPress={() => void pickAttachment()}
            style={styles.attachButton}
          >
            <MaterialIcons
              color={theme.textSecondary}
              name={uploadMutation.isPending ? 'hourglass-top' : 'attach-file'}
              size={23}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Choose an emoji"
            onPress={() => {
              Keyboard.dismiss();
              setEmojiPickerOpen(true);
            }}
            style={styles.emojiButton}
          >
            <MaterialIcons
              color={theme.textSecondary}
              name="insert-emoticon"
              size={23}
            />
          </Pressable>
          <TextInput
            multiline
            onChangeText={(value) => {
              setComposer(value);
              realtime.setTyping(Boolean(value.trim()));
            }}
            onSelectionChange={({ nativeEvent }) =>
              setComposerSelection(nativeEvent.selection)
            }
            placeholder="Write a message"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.background, color: theme.text },
            ]}
            selection={composerSelection}
            value={composer}
          />
          <Pressable
            accessibilityLabel="Send message"
            disabled={!composer.trim() && !attachment}
            onPress={submit}
            style={[
              styles.send,
              {
                backgroundColor:
                  composer.trim() || attachment ? theme.primary : theme.border,
              },
            ]}
          >
            <MaterialIcons color="#FFFFFF" name="arrow-upward" size={21} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <BottomSheet
        onClose={() => setReactionMessage(null)}
        title="React to message"
        visible={Boolean(reactionMessage)}
      >
        <View style={styles.reactionChoices}>
          {REACTIONS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() =>
                reactionMessage &&
                reactionMutation.mutate({
                  messageId: reactionMessage.id,
                  emoji,
                })
              }
              style={styles.reactionChoice}
            >
              <ThemedText style={styles.reactionEmoji}>{emoji}</ThemedText>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
      <EmojiPicker
        allowMultipleSelections
        enableRecentlyUsed
        enableSearchBar
        onClose={() => setEmojiPickerOpen(false)}
        onEmojiSelected={pickEmoji}
        open={emojiPickerOpen}
        theme={{
          backdrop: 'rgba(0,0,0,0.45)',
          container: theme.backgroundElement,
          header: theme.text,
          knob: theme.border,
          search: {
            background: theme.background,
            text: theme.text,
            placeholder: theme.textSecondary,
            icon: theme.textSecondary,
          },
        }}
      />
      {sendMutation.isError ? (
        <Toast message="Message failed to send. Tap it to retry." />
      ) : null}
      {attachmentError ? (
        <Toast
          message={attachmentError}
          onDismiss={() => setAttachmentError(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    minHeight: 62,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  messages: {
    flexGrow: 1,
    padding: Spacing.three,
    gap: 8,
    justifyContent: 'flex-end',
  },
  olderButton: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  bubble: {
    maxWidth: '82%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  theirs: { alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  mineText: { color: '#FFFFFF' },
  time: { fontSize: 10, opacity: 0.62 },
  mineMeta: { color: '#FFFFFF' },
  retry: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  reactions: { fontSize: 14 },
  attachment: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attachmentImage: {
    width: 220,
    maxWidth: '100%',
    height: 180,
    borderRadius: Radius.medium,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  composer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
  },
  selectedFile: {
    width: '100%',
    minHeight: 38,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.medium,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: Radius.large,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionChoices: { flexDirection: 'row', justifyContent: 'space-around' },
  reactionChoice: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: { fontSize: 26 },
});
