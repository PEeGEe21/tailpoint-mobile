import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { TaskItem } from './types';
export type { TaskBucket, TaskItem } from './types';

const SEVERITY_COLOR = {
  critical: '#B42318',
  high: '#D92D20',
  medium: '#D97706',
  low: '#14804A',
};

interface TaskCardProps {
  item: TaskItem;
  onPress?: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onResolve?: (id: number) => void;
}

export function TaskCard({
  item,
  onPress,
  onToggleComplete,
  onResolve,
}: TaskCardProps) {
  const theme = useTheme();
  const severityColor = item.severity
    ? SEVERITY_COLOR[item.severity]
    : theme.textSecondary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.mainRow}>
        <Pressable
          accessibilityLabel="Mark completed"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!item.completed }}
          hitSlop={8}
          onPress={() => onToggleComplete(item.id)}
          style={[
            styles.checkCircle,
            {
              backgroundColor: item.completed
                ? theme.primary
                : theme.background,
              borderColor: item.completed ? theme.primary : theme.border,
            },
          ]}
        >
          {item.completed ? (
            <MaterialIcons color="#FFFFFF" name="check" size={14} />
          ) : null}
        </Pressable>

        <Pressable onPress={() => onPress?.(item.id)} style={styles.content}>
          <View style={styles.tagRow}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: theme.background },
              ]}
            >
              <ThemedText
                style={styles.categoryLabel}
                themeColor="textSecondary"
              >
                {item.category}
              </ThemedText>
            </View>
            {item.blockedBy ? (
              <View
                style={[styles.blockedTag, { backgroundColor: '#D977061A' }]}
              >
                <MaterialIcons color="#D97706" name="lock" size={11} />
                <ThemedText style={[styles.blockedLabel, { color: '#D97706' }]}>
                  Blocked by {item.blockedBy}
                </ThemedText>
              </View>
            ) : null}
            {item.checklist ? (
              <View style={styles.checklistTag}>
                <MaterialIcons color="#14804A" name="checklist" size={12} />
                <ThemedText style={styles.checklistLabel}>
                  {item.checklist.done}/{item.checklist.total}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <ThemedText
            style={[styles.title, item.completed && styles.titleDone]}
            themeColor={item.completed ? 'textSecondary' : undefined}
          >
            {item.title}
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        {item.overdue ? (
          <View style={styles.overdueRow}>
            <MaterialIcons color="#D92D20" name="event-busy" size={14} />
            <ThemedText style={styles.overdueLabel}>
              Overdue &middot; {item.dueLabel}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.dueRow}>
            <View
              style={[styles.priorityDot, { backgroundColor: severityColor }]}
            />
            <ThemedText
              style={[styles.priorityLabel, { color: severityColor }]}
            >
              {item.severity
                ? `${item.severity[0].toUpperCase()}${item.severity.slice(1)} severity`
                : 'No severity'}
            </ThemedText>
            <ThemedText style={styles.dueSeparator} themeColor="textSecondary">
              P{item.priority}
            </ThemedText>
            <ThemedText style={styles.dueSeparator} themeColor="textSecondary">
              &bull;
            </ThemedText>
            <MaterialIcons
              color={theme.textSecondary}
              name="schedule"
              size={13}
            />
            <ThemedText style={styles.dueLabel} themeColor="textSecondary">
              {item.dueLabel}
            </ThemedText>
          </View>
        )}

        {item.overdue ? (
          <Pressable
            onPress={() => onResolve?.(item.id)}
            style={[
              styles.resolveButton,
              { backgroundColor: theme.background },
            ]}
          >
            <ThemedText style={styles.resolveLabel}>Resolve</ThemedText>
            <MaterialIcons color={theme.text} name="chevron-right" size={15} />
          </Pressable>
        ) : (
          <MaterialIcons
            color={theme.textSecondary}
            name="more-vert"
            size={18}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  blockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  blockedLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  checklistTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checklistLabel: {
    fontSize: 11,
    color: '#14804A',
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueSeparator: {
    fontSize: 12,
  },
  dueLabel: {
    fontSize: 12,
  },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  overdueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D92D20',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    minHeight: 30,
    borderRadius: 8,
  },
  resolveLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
