import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type {
  ActivityItem,
  ApprovalItem,
  ApprovalStatus,
  InboxFilter,
} from '@/features/inbox/types';

const APPROVALS: ApprovalItem[] = [
  {
    id: 'approval-1',
    project: 'Core Platform v2',
    reference: 'Gate #88',
    accentColor: '#008080',
    dueLabel: 'Due in 2h',
    dueTone: 'warning',
    title: 'Core Platform v2 — Production Deployment Gate',
    description:
      'Passes all CI checks. Awaiting Lead sign-off for organization-wide scoped cache isolation patch migration.',
    requester: {
      initials: 'ER',
      name: 'Elena Rostova',
      role: 'Staff DevOps Engineer',
      avatarColor: '#D5E3FD',
    },
    badge: {
      icon: 'shield',
      label: 'Scan clean',
      tone: 'success',
    },
    meta: {
      leftIcon: 'commit',
      leftLabel: '3 commits',
      middleIcon: 'merge',
      middleLabel: 'PR #402',
      actionLabel: 'View diff',
    },
    status: 'pending',
  },
  {
    id: 'approval-2',
    project: 'Mobile Companion',
    reference: 'RFC-19',
    accentColor: '#42B0FF',
    dueLabel: 'Due Tomorrow',
    dueTone: 'neutral',
    title: 'Mobile Companion — Offline Drafts & Sync Spec',
    description:
      'Requesting architectural sign-off on SQLite encryption schema and optimistic outbox queue semantics.',
    requester: {
      initials: 'MV',
      name: 'Marcus Vance',
      role: 'Product Manager',
      avatarColor: '#CDE5FF',
    },
    badge: {
      label: 'Spec Docs ↗',
      tone: 'neutral',
    },
    status: 'pending',
  },
  {
    id: 'approval-3',
    project: 'Infrastructure',
    reference: 'Tier-3',
    accentColor: '#006565',
    dueLabel: 'Requested 3h ago',
    dueTone: 'neutral',
    title: 'US-East High-Throughput Edge Cache Node',
    description:
      'Temporary provision increase for staging performance tests ahead of multi-region launch.',
    requester: {
      initials: 'PS',
      name: 'Priya Sharma',
      role: 'Cloud Architect',
      avatarColor: '#B6F62E',
    },
    badge: {
      label: '$140 / mo',
      tone: 'neutral',
    },
    status: 'pending',
  },
];

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'activity-1',
    icon: 'alternate-email',
    iconColor: '#006565',
    iconBackground: '#E5F5F5',
    title: '@AlexChen mentioned you in #304:',
    detail: '"Updated the FIDO2 payload format per review."',
    time: '15m ago',
    unread: true,
  },
  {
    id: 'activity-2',
    icon: 'task-alt',
    iconColor: '#006399',
    iconBackground: '#E8F4FF',
    title: 'Marcus Vance resolved dependency on API Gateway Webhook.',
    time: '1h ago',
  },
];

export default function InboxScreen() {
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<InboxFilter>('pending');

  const [approvals, setApprovals] = useState(APPROVALS);
  const [showBanner, setShowBanner] = useState(true);
  const [activities, setActivities] = useState(ACTIVITIES);

  const pendingCount = approvals.filter(
    (item) => item.status === 'pending',
  ).length;

  const notificationCount = activities.filter((item) => item.unread).length;

  const visibleApprovals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return approvals.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.project.toLowerCase().includes(query) ||
        item.requester.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeFilter === 'pending') {
        return item.status === 'pending';
      }

      if (activeFilter === 'decided') {
        return item.status !== 'pending';
      }

      return true;
    });
  }, [approvals, search, activeFilter]);

  const handleDecision = (
    id: string,
    status: Exclude<ApprovalStatus, 'pending'>,
  ) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );
  };

  const markAllRead = () => {
    setActivities((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  const filters: {
    key: InboxFilter;
    label: string;
  }[] = [
    {
      key: 'pending',
      label: `Pending (${pendingCount})`,
    },
    {
      key: 'decided',
      label: 'Decided',
    },
    {
      key: 'requested',
      label: 'Requested by Me',
    },
    {
      key: 'notifications',
      label: `Notifications (${notificationCount})`,
    },
  ];

  return (
    <ScrollView
      style={{
        backgroundColor: theme.background,
      }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleGroup}>
            <ThemedText style={styles.title}>Inbox & Approvals</ThemedText>

            {pendingCount > 0 ? (
              <View style={styles.pendingBadge}>
                <ThemedText style={styles.pendingBadgeText}>
                  {pendingCount} pending
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            <Pressable
              hitSlop={8}
              onPress={markAllRead}
              style={styles.iconButton}
            >
              <MaterialIcons
                name="done-all"
                size={22}
                color={theme.textSecondary}
              />
            </Pressable>

            <Pressable hitSlop={8} style={styles.iconButton}>
              <MaterialIcons
                name="tune"
                size={22}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          <MaterialIcons name="search" size={20} color={theme.textSecondary} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search approvals & notifications..."
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.searchInput,
              {
                color: theme.text,
              },
            ]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((filter) => {
            const active = activeFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? theme.primary : theme.background,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterLabel,
                    {
                      color: active ? '#FFFFFF' : theme.textSecondary,
                    },
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {showBanner ? (
        <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <MaterialIcons name="verified-user" size={20} color="#006399" />
            </View>

            <View style={styles.bannerContent}>
              <ThemedText style={styles.bannerTitle}>
                Sign-off Window Active
              </ThemedText>

              <ThemedText style={styles.bannerText} themeColor="textSecondary">
                2 approvals require policy sign-off before today&apos;s 18:00
                UTC deployment window.
              </ThemedText>
            </View>

            <Pressable hitSlop={8} onPress={() => setShowBanner(false)}>
              <MaterialIcons
                name="close"
                size={18}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {activeFilter !== 'notifications' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText
              style={styles.sectionEyebrow}
              themeColor="textSecondary"
            >
              {activeFilter === 'decided' ? 'DECIDED' : 'AWAITING YOUR ACTION'}
            </ThemedText>

            <Pressable>
              <ThemedText
                style={[
                  styles.sectionAction,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Batch Review
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.approvalList}>
            {visibleApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                item={approval}
                theme={theme}
                onDecision={handleDecision}
              />
            ))}

            {visibleApprovals.length === 0 ? (
              <ThemedText style={styles.emptyText} themeColor="textSecondary">
                No approvals match this view.
              </ThemedText>
            ) : null}
          </View>
        </View>
      ) : null}

      {activeFilter === 'pending' || activeFilter === 'notifications' ? (
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.activityTitle}>
              Recent Activity & Mentions
            </ThemedText>

            <Pressable onPress={markAllRead}>
              <ThemedText
                style={[
                  styles.sectionAction,
                  {
                    color: theme.primary,
                  },
                ]}
              >
                Mark all read
              </ThemedText>
            </Pressable>
          </View>

          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: theme.background,
              },
            ]}
          >
            {activities.map((activity, index) => (
              <View key={activity.id}>
                <View style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor: activity.iconBackground,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={activity.icon}
                      size={18}
                      color={activity.iconColor}
                    />
                  </View>

                  <View style={styles.activityContent}>
                    <ThemedText style={styles.activityText}>
                      {activity.title}
                    </ThemedText>

                    {activity.detail ? (
                      <ThemedText
                        style={styles.activityDetail}
                        themeColor="textSecondary"
                      >
                        {activity.detail}
                      </ThemedText>
                    ) : null}

                    <ThemedText
                      style={styles.activityTime}
                      themeColor="textSecondary"
                    >
                      {activity.time}
                    </ThemedText>
                  </View>

                  {activity.unread ? (
                    <View
                      style={[
                        styles.unreadDot,
                        {
                          backgroundColor: theme.primary,
                        },
                      ]}
                    />
                  ) : null}
                </View>

                {index < activities.length - 1 ? (
                  <View style={styles.activityDivider} />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function ApprovalCard({
  item,
  theme,
  onDecision,
}: {
  item: ApprovalItem;
  theme: ReturnType<typeof useTheme>;
  onDecision: (id: string, status: Exclude<ApprovalStatus, 'pending'>) => void;
}) {
  return (
    <View
      style={[
        styles.approvalCard,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.projectMeta}>
          <View
            style={[
              styles.projectDot,
              {
                backgroundColor: item.accentColor,
              },
            ]}
          />

          <ThemedText
            numberOfLines={1}
            style={[
              styles.projectName,
              {
                color: item.accentColor,
              },
            ]}
          >
            {item.project}
          </ThemedText>

          <ThemedText style={styles.metaDivider} themeColor="textSecondary">
            •
          </ThemedText>

          <ThemedText style={styles.reference} themeColor="textSecondary">
            {item.reference}
          </ThemedText>
        </View>

        <View
          style={[
            styles.dueBadge,
            item.dueTone === 'warning' ? styles.dueWarning : styles.dueNeutral,
          ]}
        >
          {item.dueTone === 'warning' ? (
            <MaterialIcons name="schedule" size={13} color="#D97706" />
          ) : null}

          <ThemedText
            style={[
              styles.dueText,
              {
                color:
                  item.dueTone === 'warning' ? '#D97706' : theme.textSecondary,
              },
            ]}
          >
            {item.dueLabel}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardBody}>
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>

        <ThemedText style={styles.cardDescription} themeColor="textSecondary">
          {item.description}
        </ThemedText>
      </View>

      <View style={styles.requesterRow}>
        <View style={styles.requesterInfo}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: item.requester.avatarColor,
              },
            ]}
          >
            <ThemedText style={styles.avatarText}>
              {item.requester.initials}
            </ThemedText>
          </View>

          <View style={styles.requesterText}>
            <ThemedText style={styles.requesterName} numberOfLines={1}>
              {item.requester.name}
            </ThemedText>

            <ThemedText
              style={styles.requesterRole}
              themeColor="textSecondary"
              numberOfLines={1}
            >
              {item.requester.role}
            </ThemedText>
          </View>
        </View>

        {item.badge ? (
          <View
            style={[
              styles.infoBadge,
              item.badge.tone === 'success'
                ? styles.successBadge
                : styles.neutralBadge,
            ]}
          >
            {item.badge.icon ? (
              <MaterialIcons
                name={item.badge.icon}
                size={14}
                color={
                  item.badge.tone === 'success' ? '#14804A' : theme.primary
                }
              />
            ) : null}

            <ThemedText
              style={[
                styles.infoBadgeText,
                {
                  color:
                    item.badge.tone === 'success' ? '#14804A' : theme.primary,
                },
              ]}
            >
              {item.badge.label}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {item.meta ? (
        <View style={styles.artifactBar}>
          <View style={styles.artifactItem}>
            <MaterialIcons
              name={item.meta.leftIcon}
              size={15}
              color={theme.textSecondary}
            />
            <ThemedText style={styles.artifactText} themeColor="textSecondary">
              {item.meta.leftLabel}
            </ThemedText>
          </View>

          {item.meta.middleLabel ? (
            <>
              <ThemedText themeColor="textSecondary">•</ThemedText>

              <View style={styles.artifactItem}>
                {item.meta.middleIcon ? (
                  <MaterialIcons
                    name={item.meta.middleIcon}
                    size={15}
                    color={theme.textSecondary}
                  />
                ) : null}

                <ThemedText
                  style={styles.artifactText}
                  themeColor="textSecondary"
                >
                  {item.meta.middleLabel}
                </ThemedText>
              </View>
            </>
          ) : null}

          {item.meta.actionLabel ? (
            <>
              <ThemedText themeColor="textSecondary">•</ThemedText>

              <Pressable>
                <ThemedText
                  style={[
                    styles.artifactAction,
                    {
                      color: theme.primary,
                    },
                  ]}
                >
                  {item.meta.actionLabel}
                </ThemedText>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}

      {item.status === 'pending' ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onDecision(item.id, 'approved')}
            style={[styles.actionButton, styles.approveButton]}
          >
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
            <ThemedText style={styles.approveText}>Approve</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => onDecision(item.id, 'changes')}
            style={[styles.actionButton, styles.changesButton]}
          >
            <MaterialIcons name="rate-review" size={18} color="#D97706" />
            <ThemedText style={styles.changesText}>Changes</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => onDecision(item.id, 'rejected')}
            style={[styles.actionButton, styles.rejectButton]}
          >
            <MaterialIcons name="close" size={18} color="#D92D20" />
            <ThemedText style={styles.rejectText}>Reject</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.decisionResult}>
          <MaterialIcons
            name={
              item.status === 'approved'
                ? 'check-circle'
                : item.status === 'rejected'
                  ? 'cancel'
                  : 'rate-review'
            }
            size={18}
            color={
              item.status === 'approved'
                ? '#14804A'
                : item.status === 'rejected'
                  ? '#D92D20'
                  : '#D97706'
            }
          />

          <ThemedText style={styles.decisionResultText}>
            {item.status === 'approved'
              ? 'Approved'
              : item.status === 'rejected'
                ? 'Rejected'
                : 'Changes requested'}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 36,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
  },

  pendingBadge: {
    backgroundColor: '#FDECEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  pendingBadgeText: {
    color: '#D92D20',
    fontSize: 11,
    fontWeight: '700',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  searchBox: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },

  filters: {
    gap: 8,
    paddingRight: 16,
  },

  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  bannerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  banner: {
    backgroundColor: '#DDE9FF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#C9E3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerContent: {
    flex: 1,
    gap: 3,
  },

  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  bannerText: {
    fontSize: 11,
    lineHeight: 16,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 14,
  },

  activitySection: {
    paddingHorizontal: 16,
    marginTop: 30,
    gap: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
  },

  approvalList: {
    gap: 14,
  },

  approvalCard: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },

  projectMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: 0,
  },

  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  projectName: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },

  metaDivider: {
    fontSize: 11,
  },

  reference: {
    fontSize: 11,
  },

  dueBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  dueWarning: {
    backgroundColor: '#FFF4E5',
  },

  dueNeutral: {
    backgroundColor: '#EFF3F8',
  },

  dueText: {
    fontSize: 10,
    fontWeight: '700',
  },

  cardBody: {
    gap: 5,
  },

  cardTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },

  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },

  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  requesterInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 11,
    fontWeight: '800',
  },

  requesterText: {
    flex: 1,
    minWidth: 0,
  },

  requesterName: {
    fontSize: 13,
    fontWeight: '600',
  },

  requesterRole: {
    fontSize: 11,
    marginTop: 1,
  },

  infoBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  successBadge: {
    backgroundColor: '#E8F5ED',
  },

  neutralBadge: {
    backgroundColor: '#F0F3F7',
  },

  infoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  artifactBar: {
    backgroundColor: '#F0F3F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  artifactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  artifactText: {
    fontSize: 10,
  },

  artifactAction: {
    fontSize: 10,
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  approveButton: {
    backgroundColor: '#14804A',
  },

  changesButton: {
    backgroundColor: '#E6EEFF',
  },

  rejectButton: {
    backgroundColor: '#FDECEA',
  },

  approveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  changesText: {
    fontSize: 12,
    fontWeight: '700',
  },

  rejectText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '700',
  },

  decisionResult: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F0F3F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  decisionResultText: {
    fontSize: 12,
    fontWeight: '700',
  },

  activityTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  activityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  activityRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },

  activityDetail: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 3,
    lineHeight: 17,
  },

  activityTime: {
    fontSize: 10,
    marginTop: 5,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  activityDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E6EAF0',
    marginHorizontal: 16,
  },

  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 28,
  },
});
