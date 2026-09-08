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

import { useSessionStore } from '@/auth/session-store';
import { signIn } from '@/auth/auth-api';
import { sessionManager } from '@/auth/runtime-session';
import { environment } from '@/config/env';

export default function ChooseWorkspaceScreen() {
  const theme = useTheme();
  const workspaces = useSessionStore((state) => state.organizations);
  const pendingLogin = useSessionStore((state) => state.pendingLogin);
  const [selectedId, setSelectedId] = useState(workspaces[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const continueToWorkspace = async () => {
    if (!pendingLogin || !selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn(
        environment.apiUrl,
        pendingLogin.email,
        pendingLogin.password,
        selectedId,
      );
      if (result.kind !== 'authenticated')
        throw new Error('The organization could not be selected');
      await sessionManager.establishSession(result.tokens, result.context);
      router.replace('/(app)/(tabs)');
    } catch (reason) {
      setError(
        reason &&
          typeof reason === 'object' &&
          'message' in reason &&
          typeof reason.message === 'string'
          ? reason.message
          : 'Unable to select this organization.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Workspace"
      footer={
        <AuthLink
          label="Use a different account"
          onPress={() => {
            useSessionStore.getState().clear();
            router.replace('/(public)/sign-in');
          }}
        />
      }
      subtitle="Choose where you want to start. You can switch organizations later."
      title="Select a workspace"
    >
      <View style={styles.list}>
        {workspaces.map((workspace) => {
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
                      {workspace.role ?? 'member'}
                    </ThemedText>
                  </View>
                </View>
                {selected ? <Check color={theme.primary} size={20} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <ThemedText
          accessibilityRole="alert"
          type="small"
          style={{ color: theme.danger }}
        >
          {error}
        </ThemedText>
      ) : null}
      <AuthPrimaryButton
        disabled={!selectedId || submitting}
        label={submitting ? 'Opening workspace…' : 'Continue to Tailpoint'}
        onPress={() => void continueToWorkspace()}
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
