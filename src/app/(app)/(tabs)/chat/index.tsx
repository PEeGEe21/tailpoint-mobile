import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { queryKeys } from '@/api/query-keys';
import { useSessionStore } from '@/auth/session-store';
import { FeedbackState } from '@/components/feedback-state';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet, Toast } from '@/components/ui/overlays';
import { Radius, Spacing } from '@/constants/theme';
import {
  fetchConversations,
  fetchPeers,
  startConversation,
} from '@/features/chat/chat-api';
import { mapConversation } from '@/features/chat/mappers';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const theme = useTheme();
  const organizationId = useSessionStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const conversationsQuery = useQuery({
    queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
    queryFn: fetchConversations,
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
  const peersQuery = useQuery({
    queryKey: queryKeys.chat.peers(organizationId ?? 'none'),
    queryFn: fetchPeers,
    enabled: Boolean(organizationId && newChatOpen),
  });
  const conversations = useMemo(
    () =>
      (Array.isArray(conversationsQuery.data) ? conversationsQuery.data : [])
        .map(mapConversation)
        .filter(
          (conversation) =>
            !conversation.isArchived &&
            conversation.name
              .toLowerCase()
              .includes(search.trim().toLowerCase()),
        )
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
    [conversationsQuery.data, search],
  );
  const startMutation = useMutation({
    mutationFn: startConversation,
    onSuccess: async (value) => {
      const conversation = mapConversation(value);
      setNewChatOpen(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(organizationId ?? 'none'),
      });
      router.push(`/chat/${conversation.id}` as never);
    },
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Chat</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Workspace conversations
          </ThemedText>
        </View>
        <Pressable
          accessibilityLabel="Start a conversation"
          onPress={() => setNewChatOpen(true)}
          style={[styles.newButton, { backgroundColor: theme.primary }]}
        >
          <MaterialIcons color="#FFFFFF" name="edit" size={20} />
        </Pressable>
      </View>
      <View
        style={[
          styles.search,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
      >
        <MaterialIcons color={theme.textSecondary} name="search" size={20} />
        <TextInput
          onChangeText={setSearch}
          placeholder="Search conversations"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
          value={search}
        />
      </View>
      {conversationsQuery.isPending ? (
        <FeedbackState
          description="Syncing conversations from this workspace."
          title="Loading chat"
          variant="loading"
        />
      ) : conversationsQuery.isError ? (
        <FeedbackState
          actionLabel="Try again"
          description="Conversations could not be loaded."
          onAction={() => void conversationsQuery.refetch()}
          title="Unable to load chat"
          variant="error"
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={conversations}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <FeedbackState
              actionLabel="Start a chat"
              description="Start a conversation with someone in this workspace."
              onAction={() => setNewChatOpen(true)}
              title="No conversations yet"
              variant="empty"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/chat/${item.id}` as never)}
              style={[styles.row, { borderBottomColor: theme.border }]}
            >
              <Avatar name={item.name} />
              <View style={styles.grow}>
                <View style={styles.between}>
                  <ThemedText style={styles.name}>{item.name}</ThemedText>
                  {item.isPinned ? (
                    <MaterialIcons
                      color={theme.primary}
                      name="push-pin"
                      size={14}
                    />
                  ) : null}
                </View>
                <ThemedText
                  numberOfLines={1}
                  type="small"
                  themeColor="textSecondary"
                >
                  {item.lastMessage || 'Open conversation'}
                </ThemedText>
              </View>
              {item.unreadCount ? (
                <View
                  style={[styles.badge, { backgroundColor: theme.primary }]}
                >
                  <ThemedText style={styles.badgeText}>
                    {item.unreadCount}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
      <BottomSheet
        onClose={() => setNewChatOpen(false)}
        title="New conversation"
        visible={newChatOpen}
      >
        {(Array.isArray(peersQuery.data) ? peersQuery.data : []).map(
          (value) => {
            const peer = value as Record<string, unknown>;
            const name =
              String(peer.fullName ?? '').trim() ||
              `${String(peer.first_name ?? '')} ${String(peer.last_name ?? '')}`.trim() ||
              String(peer.email ?? 'Member');
            return (
              <Pressable
                disabled={startMutation.isPending}
                key={String(peer.id)}
                onPress={() => startMutation.mutate(Number(peer.id))}
                style={[styles.peerRow, { borderBottomColor: theme.border }]}
              >
                <Avatar name={name} />
                <ThemedText style={styles.grow}>{name}</ThemedText>
                <MaterialIcons
                  color={theme.textSecondary}
                  name="chevron-right"
                  size={20}
                />
              </Pressable>
            );
          },
        )}
      </BottomSheet>
      {startMutation.isError ? (
        <Toast message="Conversation could not be started." />
      ) : null}
    </SafeAreaView>
  );
}

function Avatar({ name }: { name: string }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}
    >
      <ThemedText style={[styles.avatarText, { color: theme.primary }]}>
        {name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 28, fontWeight: '700' },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: Spacing.three,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingHorizontal: 8 },
  list: { padding: Spacing.three, paddingBottom: 110 },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  peerRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800' },
  grow: { flex: 1 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 15, fontWeight: '700' },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
