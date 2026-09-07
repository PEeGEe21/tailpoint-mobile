import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { ProjectItem, ProjectStatus } from './types';
export type { ProjectAvatar, ProjectItem, ProjectStatus } from './types';

const STATUS_META: Record<ProjectStatus, { color: string; label: string }> = {
  'on-track': { color: '#14804A', label: 'On track' },
  attention: { color: '#D97706', label: 'Attention needed' },
  'off-track': { color: '#D92D20', label: 'Off track' },
};

interface ProjectCardProps {
  item: ProjectItem;
  onPress?: (item: ProjectItem) => void;
}

export function ProjectCard({ item, onPress }: ProjectCardProps) {
  const theme = useTheme();
  const status = STATUS_META[item.status];

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
          <View style={styles.nameRow}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            <View
              style={[styles.statusDot, { backgroundColor: status.color }]}
            />
          </View>
          <ThemedText style={styles.subtitle} themeColor="textSecondary">
            {item.subtitle}
          </ThemedText>
        </View>
        <View
          style={[styles.statusPill, { backgroundColor: `${status.color}1A` }]}
        >
          <ThemedText style={[styles.statusLabel, { color: status.color }]}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <ThemedText style={styles.progressCaption} themeColor="textSecondary">
            {item.progressLabel}
          </ThemedText>
          <ThemedText style={styles.progressPercent}>
            {item.progressPercent}%
          </ThemedText>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: theme.background }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.progressPercent}%`,
                backgroundColor: status.color,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.avatarStack}>
          {item.avatars.map((avatar, index) => (
            <View
              key={`${item.id}-${avatar.initials}-${index}`}
              style={[
                styles.avatar,
                {
                  backgroundColor: avatar.color,
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: item.avatars.length - index,
                },
              ]}
            >
              <Text style={styles.avatarLabel}>{avatar.initials}</Text>
            </View>
          ))}
          {item.extraCount ? (
            <View
              style={[
                styles.avatar,
                styles.avatarExtra,
                { backgroundColor: theme.background, marginLeft: -8 },
              ]}
            >
              <ThemedText style={styles.avatarExtraLabel}>
                +{item.extraCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.updatedLabel} themeColor="textSecondary">
          {item.updatedLabel}
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
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBlock: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressCaption: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0E1C2F',
  },
  avatarExtra: {
    borderWidth: 0,
  },
  avatarExtraLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  updatedLabel: {
    fontSize: 11,
  },
});
