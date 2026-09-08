import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Building2, Check } from 'lucide-react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import {
  AuthLink,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/auth-shell';
import { useTheme } from '@/hooks/use-theme';

const WORKSPACES = [
  { id: 'primary', name: 'Your organization', role: 'Organization admin' },
  { id: 'invited', name: 'Invited workspace', role: 'Member' },
];

export default function ChooseWorkspaceScreen() {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState(WORKSPACES[0].id);

  return (
    <AuthShell
      eyebrow="Workspace"
      footer={
        <AuthLink
          label="Use a different account"
          onPress={() => router.replace('/(public)/sign-in')}
        />
      }
      subtitle="Choose where you want to start. You can switch organizations later."
      title="Select a workspace"
    >
      <View style={styles.list}>
        {WORKSPACES.map((workspace) => {
          const selected = selectedId === workspace.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={workspace.id}
              onPress={() => setSelectedId(workspace.id)}
              style={({ pressed }) => [
                styles.workspace,
                {
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.background,
                  borderColor: selected ? theme.primary : theme.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.one,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing.one,
                  }}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: theme.backgroundElement },
                    ]}
                  >
                    <Building2 color={theme.primary} size={21} />
                  </View>
                  <View style={styles.workspaceText}>
                    <ThemedText type="smallBold">{workspace.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {workspace.role}
                    </ThemedText>
                  </View>
                </View>
                {selected ? <Check color={theme.primary} size={20} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <AuthPrimaryButton
        label="Continue to Tailpoint"
        onPress={() => router.replace('/(app)/(tabs)')}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  workspace: {
    minHeight: 72,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceText: { flex: 1, gap: 2 },
});
