import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/overlays';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function QuickCreateLauncher() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  return (
    <>
      <Pressable
        accessibilityLabel="Open quick create"
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={[styles.launcher, { backgroundColor: theme.primary }]}
      >
        <ThemedText style={styles.plus}>+</ThemedText>
      </Pressable>
      <BottomSheet
        onClose={() => setVisible(false)}
        title="Quick create"
        visible={visible}
      >
        <ThemedText themeColor="textSecondary">
          Creation actions will be added with their product modules.
        </ThemedText>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  launcher: {
    position: 'absolute',
    right: Spacing.four,
    bottom: 84,
    zIndex: 10,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    elevation: 6,
  },
  plus: { color: '#FFFFFF', fontSize: 28, lineHeight: 32 },
});
