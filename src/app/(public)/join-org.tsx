import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { Choice } from '@/components/ui/primitives';
import {
  AuthFooter,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/auth-shell';
import { FormField, PasswordFormField } from '@/features/auth/form-field';
import {
  joinOrganizationSchema,
  type JoinOrganizationForm,
} from '@/features/auth/schemas';
import { joinOrganizationAccount, validateInvitation } from '@/auth/auth-api';
import { sessionManager } from '@/auth/runtime-session';
import { environment } from '@/config/env';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useState } from 'react';

export default function JoinOrgScreen() {
  const theme = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const params = useLocalSearchParams<{ code?: string; token?: string }>();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<JoinOrganizationForm>({
    defaultValues: {
      inviteMode: params.token ? 'token' : 'code',
      inviteCode: params.code ?? '',
      inviteToken: params.token ?? '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    resolver: zodResolver(joinOrganizationSchema),
    mode: 'onTouched',
  });
  const mode = useWatch({ control, name: 'inviteMode' });
  const switchMode = (next: 'code' | 'token') => {
    setValue('inviteMode', next);
    setValue(next === 'code' ? 'inviteToken' : 'inviteCode', '');
  };
  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const credential =
        values.inviteMode === 'code'
          ? { code: values.inviteCode.trim() }
          : { token: values.inviteToken.trim() };
      const invitation = await validateInvitation(
        environment.apiUrl,
        credential,
      );
      if (invitation.email.toLowerCase() !== values.email.trim().toLowerCase())
        throw new Error(`This invitation was issued to ${invitation.email}.`);
      const result = await joinOrganizationAccount(environment.apiUrl, {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        inviteCode: credential.code,
        inviteToken: credential.token,
      });
      await sessionManager.establishSession(result.tokens, result.context);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setSubmitError(
        error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
          ? error.message
          : 'Unable to accept this invitation.',
      );
    }
  });

  return (
    <AuthShell
      eyebrow="Invitation"
      footer={
        <AuthFooter
          label="No invitation?"
          action="Create an organization"
          onPress={() => router.replace('/(public)/sign-up')}
        />
      }
      subtitle="Use the invitation sent by your administrator, then create the account attached to it."
      title="Join your organization"
    >
      <View accessibilityRole="radiogroup" style={styles.modeRow}>
        <Choice
          checked={mode === 'code'}
          label="Invite code"
          onPress={() => switchMode('code')}
          radio
        />
        <Choice
          checked={mode === 'token'}
          label="Invite link token"
          onPress={() => switchMode('token')}
          radio
        />
      </View>
      {mode === 'code' ? (
        <FormField
          control={control}
          name="inviteCode"
          autoCapitalize="characters"
          label="Six-character invite code"
          maxLength={6}
        />
      ) : (
        <FormField
          control={control}
          name="inviteToken"
          autoCapitalize="none"
          label="Invitation token"
        />
      )}
      <View style={styles.nameRow}>
        <View style={styles.half}>
          <FormField
            control={control}
            name="firstName"
            autoComplete="given-name"
            label="First name"
          />
        </View>
        <View style={styles.half}>
          <FormField
            control={control}
            name="lastName"
            autoComplete="family-name"
            label="Last name"
          />
        </View>
      </View>
      <FormField
        control={control}
        name="email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Invited email"
      />
      <PasswordFormField
        control={control}
        name="password"
        autoCapitalize="none"
        autoComplete="new-password"
        label="Create password"
        onSubmitEditing={() => void submit()}
      />
      {submitError ? (
        <ThemedText
          accessibilityRole="alert"
          type="small"
          style={{ color: theme.danger }}
        >
          {submitError}
        </ThemedText>
      ) : null}
      <AuthPrimaryButton
        disabled={isSubmitting}
        label={isSubmitting ? 'Joining organization…' : 'Accept invitation'}
        onPress={() => void submit()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  nameRow: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
