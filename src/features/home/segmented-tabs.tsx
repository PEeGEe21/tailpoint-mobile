import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface SegmentedTab {
  key: string;
  label: string;
  count?: number;
}

interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SegmentedTabs({
  tabs,
  activeKey,
  onChange,
}: SegmentedTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.background }]}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              active && {
                backgroundColor: theme.backgroundElement,
                ...styles.activeShadow,
              },
            ]}
          >
            <ThemedText
              themeColor={active ? undefined : 'textSecondary'}
              style={[styles.label, active && styles.labelActive]}
            >
              {tab.label}
            </ThemedText>
            {typeof tab.count === 'number' ? (
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: active ? theme.primary : theme.border },
                ]}
              >
                {/* Plain Text here: needs a fixed white/on-primary color regardless
                    of theme, which ThemedText's themeColor prop isn't built for. */}
                <Text style={styles.countLabel}>{tab.count}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
  },
  activeShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '600',
  },
  countPill: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
