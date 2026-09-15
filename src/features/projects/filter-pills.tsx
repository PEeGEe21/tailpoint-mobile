import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface FilterPillOption {
  key: string;
  label: string;
  count: number;
  dotColor?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

interface FilterPillsProps {
  options: FilterPillOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function FilterPills({
  options,
  activeKey,
  onChange,
}: FilterPillsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const active = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.pill,
              { backgroundColor: active ? theme.primary : theme.background },
            ]}
          >
            {option.icon ? (
              <MaterialIcons
                color={active ? '#FFFFFF' : theme.primary}
                name={option.icon}
                size={13}
              />
            ) : (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active
                      ? '#FFFFFF'
                      : (option.dotColor ?? theme.primary),
                  },
                ]}
              />
            )}
            {active ? (
              <Text style={styles.label}>
                {option.count} {option.label}
              </Text>
            ) : (
              <ThemedText style={styles.labelInactive}>
                {option.count} {option.label}
              </ThemedText>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  labelInactive: {
    fontSize: 11,
    fontWeight: '600',
  },
});
