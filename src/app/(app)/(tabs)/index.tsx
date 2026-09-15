import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AttentionCard } from '@/features/home/attention-card';
import { ProjectCard, type ProjectItem } from '@/features/home/project-card';
import { SegmentedTabs } from '@/features/home/segmented-tabs';
import { TaskCard, type TaskBucket } from '@/features/home/task-card';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import { useSessionStore } from '@/auth/session-store';
import { deleteTask, listTasks } from '@/features/tasks/task-api';
import { mapTask } from '@/features/tasks/task-mappers';
import { queryKeys } from '@/api/query-keys';
import { listProjects } from '@/features/projects/project-api';
import { listApprovals } from '@/features/inbox/inbox-api';
import { mapApproval } from '@/features/inbox/inbox-mappers';
import { AlertDialog, BottomSheet, Toast } from '@/components/ui/overlays';
import { FeedbackState } from '@/components/feedback-state';

const TASK_TABS: { key: TaskBucket; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'later', label: 'Later' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = useSessionStore((state) => state.user);
  const organization = useSessionStore((state) => state.organization);
  const organizationId = useSessionStore((state) => state.organizationId);
  const [activeBucket, setActiveBucket] = useState<TaskBucket>('all');
  const [taskLimit, setTaskLimit] = useState(8);
  const [currentTime] = useState(() => Date.now());
  const [taskMenuId, setTaskMenuId] = useState<number | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
    queryFn: listTasks,
    enabled: Boolean(organizationId),
  });
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.all(organizationId ?? 'none'),
    queryFn: () => listProjects(),
    enabled: Boolean(organizationId),
  });
  const approvalsQuery = useQuery({
    queryKey: queryKeys.approvals.all(organizationId ?? 'none'),
    queryFn: listApprovals,
    enabled: Boolean(organizationId),
  });
  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: async () => {
      setDeleteTaskId(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
      });
    },
  });
  const storedTasks = useMemo(
    () => (tasksQuery.data ?? []).map(mapTask),
    [tasksQuery.data],
  );

  console.log(storedTasks, tasksQuery.data);
  const projectItems: ProjectItem[] = useMemo(
    () =>
      (projectsQuery.data ?? [])
        .filter((project) =>
          [
            'active',
            'upcoming',
            'in_progress',
            'on_review',
            'paused',
            'on_hold',
            'overdue',
          ].includes(String(project.status ?? 'active')),
        )
        .slice(0, 6)
        .map((project) => {
          const status = [
            'active',
            'upcoming',
            'in_progress',
            'on_review',
            'inactive',
            'paused',
            'on_hold',
            'completed',
            'cancelled',
            'overdue',
            'draft',
          ].includes(String(project.status))
            ? (project.status as ProjectItem['status'])
            : 'active';
          const queriedTasks = storedTasks.filter(
            (task) => task.project.id === project.id,
          );
          const embeddedTasks = Array.isArray(project.tasks)
            ? project.tasks.map(mapTask)
            : [];
          const projectTasks = queriedTasks.length
            ? queriedTasks
            : embeddedTasks;
          const done = projectTasks.filter(
            (task) => task.status.isTerminal,
          ).length;
          const progress = projectTasks.length
            ? Math.round((done / projectTasks.length) * 100)
            : 0;
          const owner =
            typeof project.user === 'object' && project.user !== null
              ? (project.user as Record<string, unknown>)
              : null;
          const peers = Array.isArray(project.projectPeers)
            ? project.projectPeers
            : [];
          const people = [
            ...(owner ? [owner] : []),
            ...peers.map((value) => {
              const peer = value as Record<string, unknown>;
              return typeof peer.user === 'object' && peer.user !== null
                ? (peer.user as Record<string, unknown>)
                : peer;
            }),
          ];
          const avatars = people.slice(0, 4).map((person) => {
            const name =
              `${String(person.first_name ?? '')} ${String(person.last_name ?? '')}`.trim() ||
              String(person.email ?? '?');
            return {
              initials: name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              color: '#D7E4ED',
            };
          });
          return {
            id: String(project.id),
            name: project.title,
            subtitle: project.description ?? 'Workspace project',
            status,
            progressLabel: `Progress (${done}/${projectTasks.length} tasks done)`,
            progressPercent: progress,
            avatars,
            extraCount:
              Math.max(0, people.length - avatars.length) || undefined,
            updatedLabel: project.updated_at
              ? `Updated ${new Date(project.updated_at).toLocaleDateString()}`
              : 'Recently updated',
          };
        }),
    [projectsQuery.data, storedTasks],
  );
  const attentionItems = useMemo(() => {
    const overdue = storedTasks.filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date).getTime() < currentTime &&
        !task.status.isTerminal,
    );
    const approvals = (approvalsQuery.data ?? [])
      .map(mapApproval)
      .filter(
        (approval) => approval.status === 'pending' && approval.canRespond,
      );
    return [
      ...(overdue.length
        ? [
            {
              id: 'overdue-tasks',
              kind: 'critical' as const,
              badgeLabel: 'Overdue',
              meta: 'Needs attention',
              title: `${overdue.length} overdue ${overdue.length === 1 ? 'task' : 'tasks'}`,
              subtitle: overdue
                .slice(0, 2)
                .map((task) => task.title)
                .join(' · '),
              actionLabel: 'Review tasks',
            },
          ]
        : []),
      ...(approvals.length
        ? [
            {
              id: 'pending-approvals',
              kind: 'approval' as const,
              badgeLabel: 'Approval',
              meta: 'Inbox',
              title: `${approvals.length} pending ${approvals.length === 1 ? 'approval' : 'approvals'}`,
              subtitle: approvals[0].subject.title,
              actionLabel: 'Open inbox',
            },
          ]
        : []),
    ];
  }, [approvalsQuery.data, currentTime, storedTasks]);
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
          statusLabel: task.status.title,
          attachmentCount: task.resources?.length ?? 0,
        };
      }),
    [storedTasks],
  );

  const tasksByBucket = useMemo(
    () =>
      TASK_TABS.map((tab) => ({
        ...tab,
        count:
          tab.key === 'all'
            ? taskItems.length
            : taskItems.filter((task) => task.bucket === tab.key).length,
      })),
    [taskItems],
  );

  const visibleTasks = useMemo(
    () =>
      activeBucket === 'all'
        ? taskItems
        : taskItems.filter((task) => task.bucket === activeBucket),
    [activeBucket, taskItems],
  );

  const toggleComplete = useCallback((id: number) => {
    router.push(`/tasks/${id}` as never);
  }, []);

  const openProject = (project: ProjectItem) =>
    router.push(`/projects/${project.id}` as never);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.projects.all(organizationId ?? 'none'),
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.approvals.all(organizationId ?? 'none'),
          exact: true,
        }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [organizationId, queryClient]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={{ backgroundColor: theme.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0EA5E9"
          colors={['#0EA5E9']}
          progressBackgroundColor="#F8FAFC"
          progressViewOffset={20}
        />
      }
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
              {organization?.name ?? 'Workspace'}
            </ThemedText>
          </View>
          <View style={styles.heroIcon}>
            <MaterialIcons color="#FFFFFF" name="north-east" size={18} />
          </View>
        </View>
        <View style={styles.heroCopy}>
          <ThemedText style={styles.heroEyebrow}>YOUR FOCUS TODAY</ThemedText>
          <ThemedText style={styles.greeting}>
            Good morning,{' '}
            {user?.firstName ?? user?.email.split('@')[0] ?? 'there'}
          </ThemedText>
          <ThemedText style={styles.greetingSubtitle}>
            {visibleTasks.length} tasks are ready to move. Start with the work
            that unlocks everything else.
          </ThemedText>
        </View>
        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <ThemedText style={styles.heroMetricValue}>
              {taskItems.filter((task) => task.bucket === 'today').length}
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
              {projectItems.length}
            </ThemedText>
            <ThemedText style={styles.heroMetricLabel}>In flight</ThemedText>
          </View>
        </View>
      </View>

      <Section title="Needs Attention">
        <FlatList
          contentContainerStyle={styles.attentionListContent}
          data={attentionItems}
          horizontal
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AttentionCard
              item={item}
              onPress={() => {
                if (item.kind === 'approval') {
                  router.push('/inbox' as never);
                  return;
                }
                const overdueTask = storedTasks.find(
                  (task) =>
                    task.due_date &&
                    new Date(task.due_date).getTime() < currentTime &&
                    !task.status.isTerminal,
                );
                if (overdueTask)
                  router.push(`/tasks/${overdueTask.id}` as never);
              }}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </Section>

      <Section title="My Tasks">
        {tasksQuery.isPending ? (
          <FeedbackState
            description="Syncing tasks from this workspace."
            title="Loading tasks"
            variant="loading"
          />
        ) : tasksQuery.isError ? (
          <FeedbackState
            actionLabel="Try again"
            description={
              tasksQuery.error instanceof Error
                ? tasksQuery.error.message
                : 'Tasks could not be loaded.'
            }
            onAction={() => void tasksQuery.refetch()}
            title="Unable to load tasks"
            variant="error"
          />
        ) : null}
        <SegmentedTabs
          activeKey={activeBucket}
          onChange={(key) => {
            setActiveBucket(key as TaskBucket);
            setTaskLimit(8);
          }}
          tabs={tasksByBucket}
        />
        <View style={styles.taskList}>
          {visibleTasks.slice(0, taskLimit).map((task) => (
            <TaskCard
              item={task}
              key={task.id}
              onPress={(id) => router.push(`/tasks/${id}` as never)}
              onMenu={setTaskMenuId}
              onToggleComplete={toggleComplete}
            />
          ))}
          {visibleTasks.length > taskLimit ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setTaskLimit((value) => value + 8)}
              style={[styles.loadMore, { borderColor: theme.border }]}
            >
              <ThemedText type="smallBold">
                Load more ({visibleTasks.length - taskLimit} remaining)
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </Section>
      <BottomSheet
        onClose={() => setTaskMenuId(null)}
        title="Task actions"
        visible={taskMenuId !== null}
      >
        <Pressable
          onPress={() => {
            const id = taskMenuId;
            setTaskMenuId(null);
            if (id) router.push(`/tasks/${id}/edit` as never);
          }}
          style={styles.taskAction}
        >
          <MaterialIcons color={theme.primary} name="edit" size={20} />
          <ThemedText type="smallBold">Edit task</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => {
            setDeleteTaskId(taskMenuId);
            setTaskMenuId(null);
          }}
          style={styles.taskAction}
        >
          <MaterialIcons color={theme.danger} name="delete-outline" size={20} />
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            Delete task
          </ThemedText>
        </Pressable>
      </BottomSheet>
      <AlertDialog
        body="Delete this task? This cannot be undone."
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete task'}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={() => deleteTaskId && deleteMutation.mutate(deleteTaskId)}
        title="Delete task"
        visible={deleteTaskId !== null}
      />
      {deleteMutation.isError ? (
        <Toast message="Task could not be deleted." />
      ) : null}

      <Section title="Active Projects">
        {projectsQuery.isPending ? (
          <FeedbackState
            description="Syncing projects from this workspace."
            title="Loading projects"
            variant="loading"
          />
        ) : projectsQuery.isError ? (
          <FeedbackState
            actionLabel="Try again"
            description={
              projectsQuery.error instanceof Error
                ? projectsQuery.error.message
                : 'Projects could not be loaded.'
            }
            onAction={() => void projectsQuery.refetch()}
            title="Unable to load projects"
            variant="error"
          />
        ) : null}
        <View style={styles.projectList}>
          {projectItems.map((project) => (
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
  loadMore: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAction: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  projectList: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
