import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Card, Progress } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { getMockProjectDetail } from '@/features/projects/mock-data';
import type { ProjectTask, ProjectTaskStatus } from '@/features/projects/types';
import { useTheme } from '@/hooks/use-theme';

type DetailTab = 'overview' | 'tasks' | 'activity';
const statusLabels = {
  active: 'Active',
  upcoming: 'Upcoming',
  in_progress: 'In progress',
  inactive: 'Inactive',
  completed: 'Completed',
  cancelled: 'Cancelled',
  on_hold: 'On hold',
  paused: 'Paused',
  on_review: 'In review',
  overdue: 'Overdue',
  draft: 'Draft',
} as const;

export default function ProjectDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = Array.isArray(id) ? id[0] : id;
  const project = useMemo(
    () => getMockProjectDetail(projectId ?? 'proj-1'),
    [projectId],
  );
  const [tab, setTab] = useState<DetailTab>('overview');
  const [statuses, setStatuses] = useState<Record<string, ProjectTaskStatus>>(
    {},
  );
  const statusColor = ['active', 'completed'].includes(project.status)
    ? theme.success
    : ['overdue', 'cancelled'].includes(project.status)
      ? theme.danger
      : ['on_hold', 'paused'].includes(project.status)
        ? theme.warning
        : theme.info;
  const completed = project.tasks.filter(
    (task) => (statuses[task.id] ?? task.status) === 'Shipped',
  ).length;
  const toggleTask = (task: ProjectTask) =>
    setStatuses((current) => ({
      ...current,
      [task.id]:
        (current[task.id] ?? task.status) === 'Shipped' ? 'Backlog' : 'Shipped',
    }));

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={[styles.navigation, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Back to projects"
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <MaterialIcons color={theme.text} name="arrow-back" size={24} />
        </Pressable>
        <ThemedText style={styles.navigationTitle}>Project details</ThemedText>
        <Pressable
          accessibilityLabel="Project options"
          style={styles.navButton}
        >
          <MaterialIcons color={theme.text} name="more-horiz" size={24} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: theme.ink }]}>
          <View
            pointerEvents="none"
            style={[styles.heroOrb, { backgroundColor: `${theme.info}30` }]}
          />
          <View style={styles.eyebrowRow}>
            <Pill label={project.tag} color={theme.info} />
            <Pill
              label={statusLabels[project.status]}
              color={statusColor}
              dot
            />
            {project.health ? (
              <Pill
                label={`${project.health === 'healthy' ? 'Healthy' : project.health === 'at_risk' ? 'At risk' : 'Blocked'} health`}
                color={
                  project.health === 'healthy' ? theme.success : theme.warning
                }
              />
            ) : null}
          </View>
          <ThemedText style={[styles.title, styles.heroTitle]}>
            {project.title}
          </ThemedText>
          <ThemedText style={[styles.description, styles.heroDescription]}>
            {project.description}
          </ThemedText>
        </View>
        <Card style={[styles.progressCard, styles.liftedCard]}>
          <View style={styles.rowBetween}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Overall progress
              </ThemedText>
              <ThemedText style={styles.progressValue}>
                {project.progressPercent}%
              </ThemedText>
            </View>
            <View
              style={[
                styles.dueBox,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <MaterialIcons color={theme.primary} name="event" size={18} />
              <View>
                <ThemedText style={styles.micro} themeColor="textSecondary">
                  Due date
                </ThemedText>
                <ThemedText style={styles.dueValue}>
                  {project.dueLabel}
                </ThemedText>
              </View>
            </View>
          </View>
          <Progress value={project.progressPercent / 100} />
          <View style={styles.stats}>
            <Stat
              value={`${project.completedTaskCount}/${project.completedTaskCount + 6}`}
              label="Tasks"
            />
            <Stat
              value={String(project.milestones.length)}
              label="Milestones"
            />
            <Stat value={String(project.members.length)} label="Members" />
          </View>
        </Card>
        <View
          accessibilityRole="tablist"
          style={[
            styles.tabs,
            {
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        >
          {(['overview', 'tasks', 'activity'] as DetailTab[]).map((item) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === item }}
              key={item}
              onPress={() => setTab(item)}
              style={[
                styles.tab,
                tab === item && { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: tab === item ? theme.primary : theme.textSecondary },
                ]}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {tab === 'overview' ? <Overview /> : null}
        {tab === 'tasks' ? (
          <>
            <SectionTitle
              title="Project tasks"
              action={`${completed} completed`}
            />
            <Card style={styles.listCard}>
              {project.tasks.map((task, index) => {
                const done = (statuses[task.id] ?? task.status) === 'Shipped';
                return (
                  <View
                    key={task.id}
                    style={[
                      styles.itemRow,
                      index > 0 && {
                        borderTopColor: theme.border,
                        borderTopWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityLabel={
                        done ? 'Mark task incomplete' : 'Mark task complete'
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      hitSlop={8}
                      onPress={() => toggleTask(task)}
                      style={[
                        styles.checkbox,
                        {
                          borderColor: done ? theme.primary : theme.border,
                          backgroundColor: done ? theme.primary : 'transparent',
                        },
                      ]}
                    >
                      {done ? (
                        <MaterialIcons color="#FFFFFF" name="check" size={16} />
                      ) : null}
                    </Pressable>
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => router.push(`/tasks/${task.id}` as never)}
                      style={styles.grow}
                    >
                      <ThemedText
                        style={[styles.itemTitle, done && styles.completed]}
                      >
                        {task.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {task.assignee.name} · {task.dueLabel}
                      </ThemedText>
                    </Pressable>
                    <View
                      style={[
                        styles.priority,
                        {
                          backgroundColor:
                            task.priority === 'high'
                              ? theme.danger
                              : task.priority === 'medium'
                                ? theme.warning
                                : theme.success,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </Card>
          </>
        ) : null}
        {tab === 'activity' ? (
          <>
            <SectionTitle title="Recent activity" />
            <Card style={styles.listCard}>
              {project.activity.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.activityRow,
                    index > 0 && {
                      borderTopColor: theme.border,
                      borderTopWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: theme.primary },
                    ]}
                  />
                  <View style={styles.grow}>
                    <ThemedText style={styles.body}>
                      <ThemedText style={styles.itemTitle}>
                        {item.actor}
                      </ThemedText>{' '}
                      {item.description}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.timeLabel}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Overview() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const project = getMockProjectDetail(
    Array.isArray(id) ? id[0] : (id ?? 'proj-1'),
  );
  return (
    <>
      <SectionTitle title="Milestones" action="View all" />
      <Card style={styles.listCard}>
        {project.milestones.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              index > 0 && {
                borderTopColor: theme.border,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View
              style={[
                styles.roundIcon,
                {
                  backgroundColor: item.completed
                    ? `${theme.success}1A`
                    : theme.backgroundSelected,
                },
              ]}
            >
              <MaterialIcons
                color={item.completed ? theme.success : theme.primary}
                name={item.completed ? 'check' : 'flag'}
                size={18}
              />
            </View>
            <View style={styles.grow}>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.completed ? 'Completed' : `Due ${item.dateLabel}`}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
      <SectionTitle title="Team" action={`${project.members.length} members`} />
      <Card style={styles.listCard}>
        {project.members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={[styles.avatar, { backgroundColor: member.color }]}>
              <ThemedText style={styles.avatarText}>
                {member.initials}
              </ThemedText>
            </View>
            <View style={styles.grow}>
              <ThemedText style={styles.itemTitle}>{member.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {member.role}
              </ThemedText>
            </View>
            <MaterialIcons
              color={theme.textSecondary}
              name="chevron-right"
              size={20}
            />
          </View>
        ))}
      </Card>
    </>
  );
}

function Pill({
  label,
  color,
  dot,
}: {
  label: string;
  color: string;
  dot?: boolean;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1A` }]}>
      {dot ? (
        <View style={[styles.pillDot, { backgroundColor: color }]} />
      ) : null}
      <ThemedText style={[styles.pillText, { color }]}>{label}</ThemedText>
    </View>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.micro} themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}
function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText style={styles.sectionHeading}>{title}</ThemedText>
      {action ? (
        <ThemedText type="small" themeColor="textSecondary">
          {action}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  navigation: {
    minHeight: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navigationTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing.three, paddingBottom: 120, gap: Spacing.three },
  hero: {
    minHeight: 220,
    padding: 20,
    paddingBottom: 48,
    borderRadius: 28,
    gap: Spacing.two,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroOrb: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -68,
    top: -82,
  },
  eyebrowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 21 },
  heroTitle: { color: '#FFFFFF', maxWidth: 310 },
  heroDescription: { color: '#D7E4ED', maxWidth: 330 },
  progressCard: { gap: Spacing.three },
  liftedCard: { marginTop: -42, marginHorizontal: 12 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  progressValue: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dueValue: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  micro: { fontSize: 11, lineHeight: 15 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    marginTop: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: { fontSize: 17, fontWeight: '700' },
  listCard: { paddingVertical: 4, gap: 0 },
  itemRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 10,
  },
  roundIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
  itemTitle: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  memberRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completed: { textDecorationLine: 'line-through', opacity: 0.6 },
  priority: { width: 8, height: 8, borderRadius: 4 },
  activityRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  activityDot: { width: 9, height: 9, borderRadius: 5, marginTop: 6 },
  body: { fontSize: 14, lineHeight: 20 },
});
