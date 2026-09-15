import { useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
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

  if (pathname.startsWith('/tasks/') || pathname.startsWith('/chat/'))
    return null;
  return (
    <>
      <TouchableOpacity
        accessibilityLabel="Open quick create"
        accessibilityRole="button"
        activeOpacity={0.72}
        hitSlop={12}
        onPress={() => setVisible(true)}
        style={[styles.launcher, { backgroundColor: theme.primary }]}
      >
        <MaterialIcons
          color="#FFFFFF"
          name="add"
          pointerEvents="none"
          size={30}
        />
      </TouchableOpacity>
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
          <View style={[styles.createActionMainDiv]}>
            <View style={[styles.createActionDiv]}>
              <View
                style={[styles.actionIcon, { backgroundColor: theme.primary }]}
              >
                <MaterialIcons color="#FFFFFF" name="add-task" size={21} />
              </View>
              <View style={styles.actionText}>
                <ThemedText type="smallBold">Create task</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Add work to a project
                </ThemedText>
              </View>
            </View>

            <MaterialIcons
              color={theme.textSecondary}
              name="chevron-right"
              size={22}
            />
          </View>
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
    zIndex: 100,
    elevation: 12,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  createAction: {
    minHeight: 68,
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
  },
  createActionMainDiv: {
    height: 'auto',
    padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
  },
  createActionDiv: {
    height: 'auto',
    // padding: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // borderRadius: Radius.medium,
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
