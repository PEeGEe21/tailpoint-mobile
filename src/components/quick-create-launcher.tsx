import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/overlays';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function QuickCreateLauncher() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const pathname = usePathname();

  if (pathname.startsWith('/tasks/')) return null;
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
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setVisible(false);
            router.push('/tasks/new' as never);
          }}
          style={({ pressed }) => [
            styles.createAction,
            {
              backgroundColor: theme.backgroundSelected,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.primary }]}>
            <MaterialIcons color="#FFFFFF" name="add-task" size={21} />
          </View>
          <View style={styles.actionText}>
            <ThemedText type="smallBold">Create task</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Add work to a project
            </ThemedText>
          </View>
          <MaterialIcons
            color={theme.textSecondary}
            name="chevron-right"
            size={22}
          />
        </Pressable>
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
  createAction: {
    minHeight: 68,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
  },
  actionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
  },
  actionText: { flex: 1 },
});
