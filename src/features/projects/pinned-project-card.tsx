import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { PinnedProject, PinnedProjectStatus } from './types';
export type { PinnedProject, PinnedProjectStatus } from './types';

const STATUS_META: Record<
  PinnedProjectStatus,
  { color: string; label: string }
> = {
  active: { color: '#14804A', label: 'Active' },
  upcoming: { color: '#006399', label: 'Upcoming' },
  in_progress: { color: '#006399', label: 'In progress' },
  inactive: { color: '#667085', label: 'Inactive' },
  completed: { color: '#14804A', label: 'Completed' },
  cancelled: { color: '#D92D20', label: 'Cancelled' },
  on_hold: { color: '#D97706', label: 'On hold' },
  paused: { color: '#667085', label: 'Paused' },
  on_review: { color: '#7F56D9', label: 'In review' },
  overdue: { color: '#D92D20', label: 'Overdue' },
  draft: { color: '#667085', label: 'Draft' },
};

interface PinnedProjectCardProps {
  project: PinnedProject;
  onPress?: (project: PinnedProject) => void;
  onMorePress?: (project: PinnedProject) => void;
}

export function PinnedProjectCard({
  project,
  onPress,
  onMorePress,
}: PinnedProjectCardProps) {
  const theme = useTheme();
  const status = STATUS_META[project.status];

  return (
    <Pressable
      onPress={() => onPress?.(project)}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTags}>
          <View style={[styles.tag, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.tagLabel} themeColor="textSecondary">
              {project.tag}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${status.color}1A` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
            <ThemedText style={[styles.statusLabel, { color: status.color }]}>
              {status.label}
            </ThemedText>
          </View>
          {project.health ? (
            <ThemedText
              style={[
                styles.healthLabel,
                {
                  color:
                    project.health === 'healthy'
                      ? theme.success
                      : theme.warning,
                },
              ]}
            >
              {project.health === 'healthy'
                ? 'Healthy'
                : project.health === 'blocked'
                  ? 'Blocked'
                  : 'At risk'}{' '}
              health
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="Project actions"
          hitSlop={8}
          onPress={() => onMorePress?.(project)}
          style={styles.moreButton}
        >
          <MaterialIcons
            color={theme.textSecondary}
            name="more-horiz"
            size={18}
          />
        </Pressable>
      </View>

      <ThemedText style={styles.title}>{project.title}</ThemedText>
      <ThemedText
        numberOfLines={2}
        style={styles.description}
        themeColor="textSecondary"
      >
        {project.description}
      </ThemedText>

      <View
        style={[styles.progressBlock, { backgroundColor: theme.background }]}
      >
        <View style={styles.progressLabelRow}>
          <ThemedText style={styles.progressPercent}>
            {project.progressPercent}% complete
          </ThemedText>
          {project.blockerLabel ? (
            <View style={styles.blockerRow}>
              <MaterialIcons color="#D92D20" name="error" size={14} />
              <Text style={styles.blockerLabel}>{project.blockerLabel}</Text>
            </View>
          ) : (
            <ThemedText
              style={styles.progressCaption}
              themeColor="textSecondary"
            >
              {project.progressLabel}
            </ThemedText>
          )}
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${project.progressPercent}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons
              color={theme.textSecondary}
              name="checklist"
              size={14}
            />
            <ThemedText style={styles.metaLabel} themeColor="textSecondary">
              {project.taskCount} Tasks
            </ThemedText>
          </View>
          {project.blocked ? (
            <View style={styles.metaItem}>
              <MaterialIcons color="#D92D20" name="warning" size={14} />
              <Text style={styles.metaLabelDanger}>Blocked</Text>
            </View>
          ) : project.milestoneCount ? (
            <View style={styles.metaItem}>
              <MaterialIcons
                color={theme.textSecondary}
                name="flag"
                size={14}
              />
              <ThemedText style={styles.metaLabel} themeColor="textSecondary">
                {project.milestoneCount} Milestones
              </ThemedText>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <MaterialIcons color={theme.primary} name="event" size={14} />
            <Text style={[styles.metaLabelAccent, { color: theme.primary }]}>
              {project.dueLabel}
            </Text>
          </View>
        </View>
        <View style={styles.avatarStack}>
          {project.avatars.map((avatar, index) => (
            <View
              key={`${project.id}-${avatar.initials}-${index}`}
              style={[
                styles.avatar,
                {
                  backgroundColor: avatar.color,
                  borderColor: theme.backgroundElement,
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: project.avatars.length - index,
                },
              ]}
            >
              <Text style={styles.avatarLabel}>{avatar.initials}</Text>
            </View>
          ))}
          {project.extraCount ? (
            <View
              style={[
                styles.avatar,
                styles.avatarExtra,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.backgroundElement,
                  marginLeft: -8,
                },
              ]}
            >
              <ThemedText style={styles.avatarExtraLabel}>
                +{project.extraCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  healthLabel: { fontSize: 11, fontWeight: '600' },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressBlock: {
    marginTop: 8,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressCaption: {
    fontSize: 13,
  },
  blockerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  blockerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D92D20',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaLabelDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D92D20',
  },
  metaLabelAccent: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarExtra: {},
  avatarExtraLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
});
