import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Card } from '@/components/ui/primitives';
import { AlertDialog, BottomSheet, Toast } from '@/components/ui/overlays';
import { FeedbackState } from '@/components/feedback-state';
import { Radius, Spacing } from '@/constants/theme';
import type { TaskSeverity } from '@/features/tasks/types';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteTask,
  getTask,
  toggleTaskPriority,
  updateTaskStatus,
} from '@/features/tasks/task-api';
import { mapTask } from '@/features/tasks/task-mappers';
import { getProject } from '@/features/projects/project-api';
import { useSessionStore } from '@/auth/session-store';
import { queryKeys } from '@/api/query-keys';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id, saved } = useLocalSearchParams<{ id: string; saved?: string }>();
  const organizationId = useSessionStore((state) => state.organizationId);
  const queryClient = useQueryClient();
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [prioritySheetOpen, setPrioritySheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const taskId = Number(id);
  const taskQuery = useQuery({
    queryKey: queryKeys.tasks.detail(organizationId ?? 'none', taskId),
    queryFn: () => getTask(taskId),
    enabled: Boolean(organizationId && Number.isFinite(taskId)),
  });
  const task = taskQuery.data ? mapTask(taskQuery.data) : null;
  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(
      organizationId ?? 'none',
      task?.project.id ?? 0,
    ),
    queryFn: () => getProject(task!.project.id),
    enabled: Boolean(organizationId && task?.project.id),
  });
  const projectData =
    typeof projectQuery.data === 'object' && projectQuery.data !== null
      ? (projectQuery.data as Record<string, unknown>)
      : {};
  const workflowStatuses = Array.isArray(projectData.statuses)
    ? (projectData.statuses as Record<string, unknown>[])
    : [];
  const statusMutation = useMutation({
    mutationFn: (statusId: number) => updateTaskStatus(taskId, statusId),
    onSuccess: async () => {
      setStatusSheetOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(organizationId ?? 'none', taskId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(
            organizationId ?? 'none',
            task?.project.id ?? 0,
          ),
        }),
      ]);
    },
  });
  const priorityMutation = useMutation({
    mutationFn: () => toggleTaskPriority(taskId, task?.priority === 1),
    onSuccess: async () => {
      setPrioritySheetOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.detail(organizationId ?? 'none', taskId),
        }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all(organizationId ?? 'none'),
      });
      router.replace('/' as never);
    },
  });

  if (taskQuery.isPending)
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <FeedbackState
          description="Syncing the latest task details."
          title="Loading task"
          variant="loading"
        />
      </SafeAreaView>
    );

  if (!task)
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <View style={styles.missing}>
          <MaterialIcons
            color={theme.textSecondary}
            name="task-alt"
            size={42}
          />
          <ThemedText style={styles.title}>Task not found</ThemedText>
          <Button onPress={() => router.back()}>Back to tasks</Button>
        </View>
      </SafeAreaView>
    );

  const priorityColor =
    task.severity === 'critical' || task.severity === 'high'
      ? theme.danger
      : task.severity === 'medium'
        ? theme.warning
        : theme.success;
  const done = task.status.isTerminal;
  const dueLabel = task.due_date
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(task.due_date),
      )
    : 'No due date';
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <MaterialIcons color={theme.text} name="arrow-back" size={24} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Task details</ThemedText>
        <Pressable
          accessibilityLabel="Edit task"
          onPress={() => router.push(`/tasks/${task.id}/edit` as never)}
          style={styles.iconButton}
        >
          <MaterialIcons color={theme.primary} name="edit" size={21} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.taskHero, { backgroundColor: theme.ink }]}>
          <View
            pointerEvents="none"
            style={[styles.heroOrb, { backgroundColor: `${theme.info}30` }]}
          />
          <View style={styles.tags}>
            <Pill
              icon="folder-open"
              label={task.project.title}
              color={theme.info}
            />
            {task.severity ? (
              <Pill
                label={severityLabel(task.severity)}
                color={priorityColor}
              />
            ) : null}
          </View>
          <ThemedText
            style={[styles.title, styles.heroTitle, done && styles.done]}
          >
            {task.title}
          </ThemedText>
          <ThemedText style={[styles.description, styles.heroDescription]}>
            {task.description || 'No description added.'}
          </ThemedText>
        </View>
        <Card style={styles.detailsCard}>
          <DetailRow icon="event" label="Due date" value={dueLabel} />
          <Divider />
          <DetailRow
            icon="person-outline"
            label="Assignee"
            value={
              task.assignees.map((item) => item.name).join(', ') || 'Unassigned'
            }
          />
          <Divider />
          <DetailRow
            icon="radio-button-checked"
            label="Status"
            onPress={() => setStatusSheetOpen(true)}
            value={task.status.title}
          />
          <Divider />
          <DetailRow
            icon="low-priority"
            label="Priority"
            onPress={() => setPrioritySheetOpen(true)}
            value={task.priority === 1 ? 'High priority' : 'Normal priority'}
          />
        </Card>
        {task.resources?.length ? (
          <Card style={styles.resourceCard}>
            <ThemedText type="smallBold">Attachments</ThemedText>
            {task.resources.map((resource) => (
              <View key={resource.id} style={styles.resourceRow}>
                <MaterialIcons
                  color={theme.primary}
                  name="attach-file"
                  size={19}
                />
                <ThemedText numberOfLines={1} style={styles.grow}>
                  {resource.title}
                </ThemedText>
              </View>
            ))}
          </Card>
        ) : null}
        <Pressable
          onPress={() => setDeleteOpen(true)}
          style={[styles.deleteButton, { borderColor: theme.danger }]}
        >
          <MaterialIcons color={theme.danger} name="delete-outline" size={20} />
          <ThemedText style={{ color: theme.danger }} type="smallBold">
            Delete task
          </ThemedText>
        </Pressable>
      </ScrollView>
      <BottomSheet
        onClose={() => setStatusSheetOpen(false)}
        title="Change task status"
        visible={statusSheetOpen}
      >
        {workflowStatuses.map((status) => (
          <Pressable
            disabled={statusMutation.isPending}
            key={String(status.id)}
            onPress={() => statusMutation.mutate(Number(status.id))}
            style={[styles.statusChoice, { borderColor: theme.border }]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: String(status.color ?? theme.primary) },
              ]}
            />
            <ThemedText style={styles.grow}>
              {String(status.title ?? 'Status')}
            </ThemedText>
            {Number(status.id) === task.status.id ? (
              <MaterialIcons color={theme.primary} name="check" size={20} />
            ) : null}
          </Pressable>
        ))}
        {!projectQuery.isPending && workflowStatuses.length === 0 ? (
          <ThemedText themeColor="textSecondary">
            No workflow statuses are available for this project.
          </ThemedText>
        ) : null}
      </BottomSheet>
      <BottomSheet
        onClose={() => setPrioritySheetOpen(false)}
        title="Change task priority"
        visible={prioritySheetOpen}
      >
        {[
          { label: 'Normal priority', value: 0 },
          { label: 'High priority', value: 1 },
        ].map((option) => (
          <Pressable
            disabled={priorityMutation.isPending}
            key={option.value}
            onPress={() => {
              if (option.value === task.priority) setPrioritySheetOpen(false);
              else priorityMutation.mutate();
            }}
            style={[styles.statusChoice, { borderColor: theme.border }]}
          >
            <MaterialIcons
              color={option.value ? theme.danger : theme.textSecondary}
              name={option.value ? 'priority-high' : 'remove'}
              size={20}
            />
            <ThemedText style={styles.grow}>{option.label}</ThemedText>
            {option.value === task.priority ? (
              <MaterialIcons color={theme.primary} name="check" size={20} />
            ) : null}
          </Pressable>
        ))}
      </BottomSheet>
      <AlertDialog
        body={`Delete “${task.title}”? This cannot be undone.`}
        confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete task'}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete task"
        visible={deleteOpen}
      />
      {statusMutation.isError ? (
        <Toast message="The task status could not be updated." />
      ) : null}
      {priorityMutation.isError ? (
        <Toast message="The task priority could not be updated." />
      ) : null}
      {deleteMutation.isError ? (
        <Toast message="The task could not be deleted." />
      ) : null}
      {saved === '1' ? (
        <Toast message="Task saved successfully." variant="success" />
      ) : null}
    </SafeAreaView>
  );
}

function severityLabel(value: TaskSeverity) {
  return `${value[0].toUpperCase()}${value.slice(1)} severity`;
}
function Pill({
  color,
  icon,
  label,
}: {
  color: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1A` }]}>
      {icon ? (
        <MaterialIcons color={color} name={icon} size={14} />
      ) : (
        <View style={[styles.dot, { backgroundColor: color }]} />
      )}
      <ThemedText style={[styles.pillText, { color }]}>{label}</ThemedText>
    </View>
  );
}
function DetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <MaterialIcons color={theme.textSecondary} name={icon} size={20} />
      <ThemedText style={styles.detailLabel} themeColor="textSecondary">
        {label}
      </ThemedText>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        hitSlop={8}
        onPress={onPress}
        style={styles.detailAction}
      >
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
        {onPress ? (
          <MaterialIcons color={theme.primary} name="edit" size={16} />
        ) : null}
      </Pressable>
    </View>
  );
}
function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    minHeight: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  content: { padding: Spacing.three, paddingBottom: 120, gap: Spacing.three },
  taskHero: {
    minHeight: 230,
    padding: 20,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    gap: 12,
  },
  heroOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -70,
    top: -80,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  pillText: { fontSize: 11, fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { fontSize: 28, lineHeight: 35, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
  heroTitle: { color: '#FFFFFF', maxWidth: 320 },
  heroDescription: { color: '#D7E4ED', maxWidth: 330 },
  done: { textDecorationLine: 'line-through', opacity: 0.6 },
  detailsCard: { gap: 0 },
  resourceCard: { gap: Spacing.two },
  resourceRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: { flex: 1, fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600' },
  detailAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { height: StyleSheet.hairlineWidth },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: { fontSize: 17, fontWeight: '700' },
  activity: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: { flex: 1 },
  statusChoice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: 12,
  },
  bold: { fontWeight: '700' },
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
