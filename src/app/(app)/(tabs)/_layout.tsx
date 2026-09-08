import { Tabs } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
          headerShown: false,
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
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons color={color} name="dashboard" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: 'Projects',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons color={color} name="folder-open" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            // TODO: replace with the live unread count once the inbox feed
            // is wired up — hardcoded to match the mockup for now.
            tabBarBadge: 3,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons color={color} name="inbox" size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: 'You',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons color={color} name="person" size={size} />
            ),
          }}
        />
        <Tabs.Screen name="tasks" options={{ href: null }} />
      </Tabs>
      <QuickCreateLauncher />
    </View>
  );
}
