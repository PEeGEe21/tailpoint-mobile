import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Field } from '@/components/ui/primitives';
import { ThemedText } from '@/components/themed-text';
import { AuthPrimaryButton, AuthShell } from '@/features/auth/auth-shell';
import {
  createWorkspace,
  joinWorkspace,
} from '@/features/organizations/organization-api';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function WorkspaceEntryScreen() {
  const theme = useTheme();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'create') await createWorkspace(value);
      else await joinWorkspace(value);
      router.replace('/(app)/(tabs)');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to open workspace.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Workspace"
      title="Choose your next workspace"
      subtitle="Create a workspace or join one using your invitation."
    >
      <View style={[styles.tabs, { backgroundColor: theme.backgroundElement }]}>
        {(['create', 'join'] as const).map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              setMode(option);
              setValue('');
              setError(null);
            }}
            style={[
              styles.tab,
              mode === option && { backgroundColor: theme.background },
            ]}
          >
            <ThemedText type="smallBold">
              {option === 'create' ? 'Create workspace' : 'Join workspace'}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <Field
        label={mode === 'create' ? 'Workspace name' : 'Invitation code'}
        value={value}
        onChangeText={setValue}
        autoCapitalize={mode === 'create' ? 'words' : 'characters'}
      />
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
        disabled={!value.trim() || submitting}
        label={submitting ? 'Opening workspace…' : 'Continue to Tailpoint'}
        onPress={() => void submit()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderRadius: Radius.medium, padding: 4 },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Radius.small,
    padding: Spacing.two,
  },
});
