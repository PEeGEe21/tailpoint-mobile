import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';

import { QuickCreateLauncher } from '@/components/quick-create-launcher';
import { useTheme } from '@/hooks/use-theme';
import { getNavigationPlacement } from '@/navigation/layout';

export default function TabsLayout() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const tabBarPosition = getNavigationPlacement(width);
  const largeScreen = tabBarPosition === 'left';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.backgroundElement },
          headerTintColor: theme.text,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarPosition,
          tabBarStyle: {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            width: largeScreen ? 220 : undefined,
          },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
        <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
        <Tabs.Screen name="you" options={{ title: 'You' }} />
      </Tabs>
      <QuickCreateLauncher />
    </View>
  );
}
