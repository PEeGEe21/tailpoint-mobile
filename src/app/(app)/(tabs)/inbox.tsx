import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { MOCK_APPROVALS, MOCK_NOTIFICATIONS } from '@/features/inbox/mock-data';
import type { ApprovalItem, InboxFilter } from '@/features/inbox/types';
import { useTheme } from '@/hooks/use-theme';

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'decided', label: 'Decided' },
  { key: 'requested', label: 'Requested by me' },
  { key: 'notifications', label: 'Notifications' },
];
export default function InboxScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<InboxFilter>('pending');
  const [query, setQuery] = useState('');
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const visible = useMemo(
    () =>
      approvals.filter((item) => {
        const matches =
          `${item.subject.title} ${item.projectTitle} ${item.requestedBy?.name ?? ''}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        if (!matches) return false;
        if (filter === 'pending')
          return item.status === 'pending' && item.canRespond;
        if (filter === 'decided')
          return item.responses.some((response) => response.reviewerId === 11);
        if (filter === 'requested') return item.requestedBy?.id === 11;
        return false;
      }),
    [approvals, filter, query],
  );
  const decide = (id: string, decision: 'approved' | 'rejected') =>
    setApprovals((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: decision,
              canRespond: false,
              responses: [
                ...item.responses,
                {
                  id: `mock-${Date.now()}`,
                  reviewerId: 11,
                  reviewer: {
                    id: 11,
                    name: 'Jordan Davis',
                    email: 'jordan@acmestudio.com',
                  },
                  decision,
                  comment: null,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : item,
      ),
    );
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: theme.ink }]}>
          <ThemedText style={styles.eyebrow}>DECISIONS & UPDATES</ThemedText>
          <ThemedText style={styles.title}>Inbox</ThemedText>
          <ThemedText style={styles.heroText}>
            {
              approvals.filter(
                (item) => item.status === 'pending' && item.canRespond,
              ).length
            }{' '}
            reviews are waiting for you.
          </ThemedText>
        </View>
        <View
          style={[
            styles.search,
            {
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        >
          <MaterialIcons color={theme.textSecondary} name="search" size={20} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search inbox"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
          />
        </View>
        <ScrollView
          horizontal
          contentContainerStyle={styles.filters}
          showsHorizontalScrollIndicator={false}
        >
          {FILTERS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.filter,
                {
                  borderColor:
                    filter === item.key ? theme.primary : theme.border,
                  backgroundColor:
                    filter === item.key
                      ? theme.backgroundSelected
                      : theme.backgroundElement,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  filter === item.key && { color: theme.primary },
                ]}
              >
                {item.label}
                {item.key === 'notifications'
                  ? ` (${notifications.filter((n) => !n.is_read).length})`
                  : ''}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
        {filter === 'notifications' ? (
          <View style={styles.list}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  setNotifications((rows) =>
                    rows.map((row) =>
                      row.id === item.id ? { ...row, is_read: true } : row,
                    ),
                  )
                }
                style={[styles.row, { borderBottomColor: theme.border }]}
              >
                <View
                  style={[
                    styles.icon,
                    { backgroundColor: theme.backgroundSelected },
                  ]}
                >
                  <MaterialIcons
                    color={theme.primary}
                    name="notifications-none"
                    size={20}
                  />
                </View>
                <View style={styles.grow}>
                  <View style={styles.between}>
                    <ThemedText style={styles.itemTitle}>
                      {item.title}
                    </ThemedText>
                    {!item.is_read ? (
                      <View
                        style={[styles.dot, { backgroundColor: theme.primary }]}
                      />
                    ) : null}
                  </View>
                  {item.message ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.message}
                    </ThemedText>
                  ) : null}
                  <ThemedText style={styles.time} themeColor="textSecondary">
                    {formatDate(item.created_at)}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {visible.map((item) => (
              <ApprovalRow item={item} key={item.id} onDecision={decide} />
            ))}
            {visible.length === 0 ? (
              <ThemedText style={styles.empty} themeColor="textSecondary">
                Nothing in this view.
              </ThemedText>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function ApprovalRow({
  item,
  onDecision,
}: {
  item: ApprovalItem;
  onDecision: (id: string, decision: 'approved' | 'rejected') => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.approval,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}
    >
      <View style={styles.between}>
        <View
          style={[
            styles.subject,
            { backgroundColor: theme.backgroundSelected },
          ]}
        >
          <ThemedText style={[styles.subjectText, { color: theme.primary }]}>
            {item.subjectType}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {item.status}
        </ThemedText>
      </View>
      <ThemedText style={styles.approvalTitle}>{item.subject.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {item.projectTitle} · requested by {item.requestedBy?.name ?? 'Unknown'}
      </ThemedText>
      {item.message ? (
        <ThemedText style={styles.message} themeColor="textSecondary">
          {item.message}
        </ThemedText>
      ) : null}
      <View style={styles.reviewMeta}>
        <MaterialIcons color={theme.textSecondary} name="group" size={16} />
        <ThemedText type="small" themeColor="textSecondary">
          {item.reviewers.map((person) => person.name).join(', ')}
        </ThemedText>
      </View>
      {item.dueAt ? (
        <ThemedText type="small" style={{ color: theme.warning }}>
          Due {formatDate(item.dueAt)}
        </ThemedText>
      ) : null}
      {item.canRespond ? (
        <View style={styles.actions}>
          <Pressable
            onPress={() => onDecision(item.id, 'approved')}
            style={[styles.action, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.actionPrimary}>Approve</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => onDecision(item.id, 'rejected')}
            style={[
              styles.action,
              { borderColor: theme.danger, borderWidth: 1 },
            ]}
          >
            <ThemedText style={{ color: theme.danger, fontWeight: '700' }}>
              Reject
            </ThemedText>
          </Pressable>
        </View>
      ) : item.responses.length ? (
        <ThemedText type="small" themeColor="textSecondary">
          Decision: {item.responses[item.responses.length - 1].decision}
        </ThemedText>
      ) : null}
    </View>
  );
}
const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: 120, gap: Spacing.three },
  hero: {
    minHeight: 190,
    borderRadius: 28,
    padding: 20,
    justifyContent: 'flex-end',
    gap: 6,
  },
  eyebrow: {
    color: '#9DE5DF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#FFFFFF', fontSize: 32, lineHeight: 38, fontWeight: '700' },
  heroText: { color: '#D7E4ED', fontSize: 14 },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingHorizontal: 8 },
  filters: { gap: 8 },
  filter: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  list: { gap: 10 },
  approval: { borderWidth: 1, borderRadius: Radius.large, padding: 16, gap: 8 },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  subject: {
    borderRadius: Radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  subjectText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  approvalTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  message: { fontSize: 13, lineHeight: 19 },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  action: {
    minHeight: 42,
    flex: 1,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { color: '#FFFFFF', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1, gap: 3 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  time: { fontSize: 11 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  empty: { textAlign: 'center', paddingVertical: 32 },
});
