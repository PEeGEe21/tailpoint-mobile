import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AttentionCard } from '@/features/home/attention-card';
import { ProjectCard, type ProjectItem } from '@/features/home/project-card';
import { SegmentedTabs } from '@/features/home/segmented-tabs';
import { TaskCard, type TaskBucket } from '@/features/home/task-card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import {
  ATTENTION_ITEMS,
  PROJECT_ITEMS,
  TASK_TABS,
} from '@/features/home/mock-data';
import { useTaskStore } from '@/features/tasks/task-store';
import { PROJECT_WORKFLOW_STATUSES } from '@/features/tasks/mock-data';
import { MOCK_USER_PROFILE } from '@/features/profile/mock-data';

export default function HomeScreen() {
  const theme = useTheme();
  const [activeBucket, setActiveBucket] = useState<TaskBucket>('today');
  const storedTasks = useTaskStore((state) => state.tasks);
  const setTaskStatus = useTaskStore((state) => state.setStatus);
  const taskItems = useMemo(
    () =>
      storedTasks.map((task) => {
        const due = task.due_date ? new Date(task.due_date) : null;
        const today = new Date();
        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );
        const dayOffset = due
          ? Math.floor(
              (new Date(
                due.getFullYear(),
                due.getMonth(),
                due.getDate(),
              ).getTime() -
                start.getTime()) /
                86_400_000,
            )
          : Number.POSITIVE_INFINITY;
        return {
          id: task.id,
          bucket: (dayOffset <= 0
            ? 'today'
            : dayOffset <= 7
              ? 'upcoming'
              : 'later') as TaskBucket,
          category: task.project.title,
          title: task.title,
          priority: task.priority,
          severity: task.severity,
          dueLabel: due
            ? new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
              }).format(due)
            : 'No due date',
          overdue: Boolean(
            due && due.getTime() < start.getTime() && !task.status.isTerminal,
          ),
          completed: task.status.isTerminal,
        };
      }),
    [storedTasks],
  );

  const tasksByBucket = useMemo(
    () =>
      TASK_TABS.map((tab) => ({
        ...tab,
        count: taskItems.filter((task) => task.bucket === tab.key).length,
      })),
    [taskItems],
  );

  const visibleTasks = useMemo(
    () => taskItems.filter((task) => task.bucket === activeBucket),
    [activeBucket, taskItems],
  );

  const toggleComplete = useCallback(
    (id: number) => {
      const task = useTaskStore.getState().tasks.find((item) => item.id === id);
      if (task) {
        const statuses = PROJECT_WORKFLOW_STATUSES[task.project.id];
        setTaskStatus(
          id,
          task.status.isTerminal
            ? statuses[0].id
            : statuses.find((status) => status.isTerminal)!.id,
        );
      }
    },
    [setTaskStatus],
  );

  const openProject = (project: ProjectItem) =>
    router.push(`/projects/${project.id}` as never);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ backgroundColor: theme.background }}
    >
      <View style={[styles.focusHero, { backgroundColor: theme.ink }]}>
        <View
          pointerEvents="none"
          style={[styles.heroOrbLarge, { backgroundColor: `${theme.info}2E` }]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.heroOrbSmall,
            { backgroundColor: `${theme.primary}55` },
          ]}
        />
        <View style={styles.heroTopRow}>
          <View style={styles.workspacePill}>
            <View
              style={[styles.workspaceDot, { backgroundColor: theme.accent }]}
            />
            <ThemedText style={styles.workspaceLabel}>
              {MOCK_USER_PROFILE.organization}
            </ThemedText>
          </View>
          <View style={styles.heroIcon}>
            <MaterialIcons color="#FFFFFF" name="north-east" size={18} />
          </View>
        </View>
        <View style={styles.heroCopy}>
          <ThemedText style={styles.heroEyebrow}>YOUR FOCUS TODAY</ThemedText>
          <ThemedText style={styles.greeting}>
            Good morning, {MOCK_USER_PROFILE.name.split(' ')[0]}
          </ThemedText>
          <ThemedText style={styles.greetingSubtitle}>
            {visibleTasks.length} tasks are ready to move. Start with the work
            that unlocks everything else.
          </ThemedText>
        </View>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricValue}>
              {visibleTasks.length}
            </ThemedText>
            <ThemedText style={styles.heroMetricLabel}>Due today</ThemedText>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricValue}>
              {storedTasks.filter((task) => task.status.isTerminal).length}
            </ThemedText>
            <ThemedText style={styles.heroMetricLabel}>Completed</ThemedText>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricValue}>
              {PROJECT_ITEMS.length}
            </ThemedText>
            <ThemedText style={styles.heroMetricLabel}>In flight</ThemedText>
          </View>
        </View>
      </View>

      <Section title="Needs Attention">
        <FlatList
          contentContainerStyle={styles.attentionListContent}
          data={ATTENTION_ITEMS}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AttentionCard item={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </Section>

      <Section title="My Tasks">
        <SegmentedTabs
          activeKey={activeBucket}
          onChange={(key) => setActiveBucket(key as TaskBucket)}
          tabs={tasksByBucket}
        />
        <View style={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskCard
              item={task}
              key={task.id}
              onPress={(id) => router.push(`/tasks/${id}` as never)}
              onToggleComplete={toggleComplete}
            />
          ))}
        </View>
      </Section>

      <Section title="Active Projects">
        <View style={styles.projectList}>
          {PROJECT_ITEMS.map((project) => (
            <ProjectCard
              item={project}
              key={project.id}
              onPress={() => openProject(project)}
            />
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  focusHero: {
    margin: 16,
    padding: 20,
    minHeight: 260,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -75,
    top: -85,
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    left: -42,
    bottom: -40,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF18',
  },
  workspaceDot: { width: 7, height: 7, borderRadius: 4 },
  workspaceLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { gap: 7, maxWidth: 300 },
  heroEyebrow: {
    color: '#9DE5DF',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  greetingSubtitle: {
    color: '#D7E4ED',
    fontSize: 14,
    lineHeight: 20,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FFFFFF30',
  },
  heroMetric: { flex: 1 },
  heroMetricValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  heroMetricLabel: { color: '#B8C9D6', fontSize: 10 },
  heroMetricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: '#FFFFFF30',
    marginHorizontal: 12,
  },
  section: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    paddingHorizontal: 16,
  },
  attentionListContent: {
    paddingHorizontal: 16,
  },
  taskList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  projectList: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
