import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  AppearancePreference,
  useAppearanceStore,
} from '@/state/appearance-store';

const options: { label: string; value: AppearancePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function AppearanceSelector() {
  const theme = useTheme();
  const preference = useAppearanceStore((state) => state.preference);
  const setPreference = useAppearanceStore((state) => state.setPreference);

  return (
    <View accessibilityRole="radiogroup" style={styles.group}>
      {options.map((option) => {
        const selected = option.value === preference;
        return (
          <Pressable
            accessibilityLabel={`${option.label} appearance`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={option.value}
            onPress={() => setPreference(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: selected
                  ? theme.backgroundSelected
                  : theme.backgroundElement,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}
          >
            <ThemedText type="smallBold">{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', gap: Spacing.two },
  option: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
});
