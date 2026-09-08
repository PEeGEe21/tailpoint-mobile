import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button, Card } from '@/components/ui/primitives';
import { Radius, Spacing } from '@/constants/theme';
import { useTaskStore } from '@/features/tasks/task-store';
import type { TaskSeverity } from '@/features/tasks/types';
import { PROJECT_WORKFLOW_STATUSES } from '@/features/tasks/mock-data';
import { useTheme } from '@/hooks/use-theme';

export default function TaskDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTaskStore((state) =>
    state.tasks.find((item) => item.id === Number(id)),
  );
  const setStatus = useTaskStore((state) => state.setStatus);

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
  const workflowStatuses = PROJECT_WORKFLOW_STATUSES[task.project.id];
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
        <Button
          onPress={() =>
            setStatus(
              task.id,
              done
                ? workflowStatuses[0].id
                : workflowStatuses.find((status) => status.isTerminal)!.id,
            )
          }
        >
          {done ? 'Reopen task' : 'Mark as complete'}
        </Button>
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
            value={task.status.title}
          />
          <Divider />
          <DetailRow
            icon="low-priority"
            label="Priority"
            value={String(task.priority)}
          />
        </Card>
      </ScrollView>
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
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <MaterialIcons color={theme.textSecondary} name={icon} size={20} />
      <ThemedText style={styles.detailLabel} themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
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
  detailRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: { flex: 1, fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '600' },
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
  bold: { fontWeight: '700' },
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
