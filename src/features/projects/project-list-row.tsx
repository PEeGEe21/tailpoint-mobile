import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ProjectListItem, ProjectRowStatus } from './types';
export type { ProjectListItem, ProjectRowStatus } from './types';

const STATUS_STYLE: Record<ProjectRowStatus, { bg: string; text: string }> = {
  'on-track': { bg: '#14804A1A', text: '#14804A' },
  review: { bg: '#0063991A', text: '#006399' },
  paused: { bg: '#8A94A61A', text: '#667085' },
};

interface ProjectListRowProps {
  item: ProjectListItem;
  onPress?: (item: ProjectListItem) => void;
}

export function ProjectListRow({ item, onPress }: ProjectListRowProps) {
  const theme = useTheme();
  const statusStyle = STATUS_STYLE[item.status];

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: theme.background }]}>
              <ThemedText style={styles.tagLabel} themeColor="textSecondary">
                {item.tag}
              </ThemedText>
            </View>
            <ThemedText style={styles.updatedLabel} themeColor="textSecondary">
              {item.updatedLabel}
            </ThemedText>
          </View>
          <ThemedText numberOfLines={1} style={styles.title}>
            {item.title}
          </ThemedText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusLabel, { color: statusStyle.text }]}>
            {item.statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View
          style={[styles.progressTrack, { backgroundColor: theme.background }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.progressPercent}%`,
                backgroundColor:
                  item.status === 'paused'
                    ? theme.textSecondary
                    : theme.primary,
              },
            ]}
          />
        </View>
        <ThemedText style={styles.progressPercent}>
          {item.progressPercent}%
        </ThemedText>
        <ThemedText style={styles.taskCount} themeColor="textSecondary">
          {item.taskCount} Tasks
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  updatedLabel: {
    fontSize: 11,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 12,
  },
});
