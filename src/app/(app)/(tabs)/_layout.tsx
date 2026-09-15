import { Tabs, usePathname } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuickCreateLauncher } from '@/components/quick-create-launcher';
import { useTheme } from '@/hooks/use-theme';
import { getNavigationPlacement } from '@/navigation/layout';
import { MessageCircleMore } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/auth/session-store';
import { queryKeys } from '@/api/query-keys';
import { listApprovals, listNotifications } from '@/features/inbox/inbox-api';
import { mapApproval } from '@/features/inbox/inbox-mappers';

export default function TabsLayout() {
  const theme = useTheme();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const tabBarPosition = getNavigationPlacement(width);
  const largeScreen = tabBarPosition === 'left';
  const isChatThread = /^\/chat\/[^/]+$/.test(pathname);
  const organizationId = useSessionStore((state) => state.organizationId);
  const approvalsQuery = useQuery({
    queryKey: queryKeys.approvals.all(organizationId ?? 'none'),
    queryFn: listApprovals,
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.all(organizationId ?? 'none'),
    queryFn: listNotifications,
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
  const inboxCount =
    (approvalsQuery.data ?? [])
      .map(mapApproval)
      .filter((item) => item.status === 'pending' && item.canRespond).length +
    (notificationsQuery.data ?? []).filter((item) => !item.is_read).length;

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
            display: isChatThread && !largeScreen ? 'none' : 'flex',
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
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <MessageCircleMore size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
            tabBarBadge: inboxCount || undefined,
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
