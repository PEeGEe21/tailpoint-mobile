import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { AttentionItem, AttentionKind } from './types';
export type { AttentionItem, AttentionKind } from './types';

const KIND_META: Record<
  AttentionKind,
  {
    color: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    actionIcon: keyof typeof MaterialIcons.glyphMap;
  }
> = {
  critical: { color: '#D92D20', icon: 'warning', actionIcon: 'arrow-forward' },
  blocked: { color: '#D97706', icon: 'lock', actionIcon: 'send' },
  approval: {
    color: '#006399',
    icon: 'assignment-turned-in',
    actionIcon: 'arrow-right-alt',
  },
};

interface AttentionCardProps {
  item: AttentionItem;
  onPress?: (item: AttentionItem) => void;
}

export function AttentionCard({ item, onPress }: AttentionCardProps) {
  const theme = useTheme();
  const meta = KIND_META[item.kind];

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
          <MaterialIcons color={meta.color} name={meta.icon} size={12} />
          <ThemedText style={[styles.badgeLabel, { color: meta.color }]}>
            {item.badgeLabel}
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {item.meta}
        </ThemedText>
      </View>

      <View style={styles.body}>
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        <ThemedText
          numberOfLines={1}
          style={styles.subtitle}
          themeColor="textSecondary"
        >
          {item.subtitle}
        </ThemedText>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <ThemedText style={[styles.actionLabel, { color: meta.color }]}>
          {item.actionLabel}
        </ThemedText>
        <MaterialIcons color={meta.color} name={meta.actionIcon} size={16} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    justifyContent: 'space-between',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 11,
  },
  body: {
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
