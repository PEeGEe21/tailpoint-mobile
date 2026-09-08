import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Progress } from '@/components/ui/primitives';
import { ThemedText } from '@/components/themed-text';
import {
  AuthFooter,
  AuthLink,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/auth-shell';
import { FormField, PasswordFormField } from '@/features/auth/form-field';
import {
  createOrganizationSchema,
  type CreateOrganizationForm,
} from '@/features/auth/schemas';
import { createOrganizationAccount } from '@/auth/auth-api';
import { sessionManager } from '@/auth/runtime-session';
import { environment } from '@/config/env';
import { useTheme } from '@/hooks/use-theme';

const DEFAULT_VALUES: CreateOrganizationForm = {
  email: '',
  firstName: '',
  lastName: '',
  organizationName: '',
  password: '',
  confirmPassword: '',
};

export default function SignUpScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = useForm<CreateOrganizationForm>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(createOrganizationSchema),
    mode: 'onTouched',
  });
  const continueToOrganization = async () => {
    if (
      await trigger([
        'firstName',
        'lastName',
        'email',
        'password',
        'confirmPassword',
      ])
    )
      setStep(2);
  };
  const finish = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await createOrganizationAccount(
        environment.apiUrl,
        values,
      );
      await sessionManager.establishSession(result.tokens, result.context);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setSubmitError(
        error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
          ? error.message
          : 'Unable to create your organization.',
      );
    }
  });

  return (
    <AuthShell
      eyebrow={`Create organization · Step ${step} of 2`}
      footer={
        <View style={styles.footerStack}>
          <AuthFooter
            label="Already have an account?"
            action="Sign in"
            onPress={() => router.replace('/(public)/sign-in')}
          />
          <AuthLink
            label="Have an invitation? Join instead"
            onPress={() => router.replace('/(public)/join-org')}
          />
        </View>
      }
      subtitle={
        step === 1
          ? 'Start with the account that will administer your new workspace.'
          : 'Name your workspace. You can invite the rest of your team later.'
      }
      title={step === 1 ? 'Create your account' : 'Set up your organization'}
    >
      <Progress value={step / 2} />
      {step === 1 ? (
        <>
          <View style={styles.row}>
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
            label="Work email"
          />
          <PasswordFormField
            control={control}
            name="password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="Password"
          />
          <PasswordFormField
            control={control}
            name="confirmPassword"
            autoCapitalize="none"
            label="Confirm password"
            onSubmitEditing={() => void continueToOrganization()}
          />
          <AuthPrimaryButton
            label="Continue"
            onPress={() => void continueToOrganization()}
          />
        </>
      ) : (
        <>
          <FormField
            control={control}
            name="organizationName"
            autoCapitalize="words"
            label="Organization name"
            onSubmitEditing={() => void finish()}
            placeholder="Acme Studio"
          />
          <ThemedText type="small" themeColor="textSecondary">
            This creates your organization and assigns you the organization
            administrator role.
          </ThemedText>
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
            label={
              isSubmitting ? 'Creating organization…' : 'Create organization'
            }
            onPress={() => void finish()}
          />
          <AuthLink
            label="Back to account details"
            onPress={() => setStep(1)}
          />
        </>
      )}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  footerStack: { alignItems: 'center', gap: 12 },
});
