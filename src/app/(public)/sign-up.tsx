import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Field, Progress } from '@/components/ui/primitives';
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
import {
  createOrganizationAccount,
  requestSignupEmailVerification,
  verifySignupEmail,
} from '@/auth/auth-api';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    getValues,
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
    ) {
      try {
        setSubmitError(null);
        const values = getValues();
        await requestSignupEmailVerification(environment.apiUrl, values.email);
        setStep(2);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to send verification code.',
        );
      }
    }
  };
  const finish = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await createOrganizationAccount(environment.apiUrl, {
        ...values,
        verificationToken,
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
          : 'Unable to create your organization.',
      );
    }
  });

  return (
    <AuthShell
      eyebrow={`Create organization · Step ${step} of 3`}
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
          : step === 2
            ? 'Enter the six-digit code sent to your email.'
            : 'Name your workspace. You can invite the rest of your team later.'
      }
      title={
        step === 1
          ? 'Create your account'
          : step === 2
            ? 'Verify your email'
            : 'Set up your organization'
      }
    >
      <Progress value={step / 3} />
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
      ) : step === 2 ? (
        <>
          <Field
            label="Verification code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
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
            disabled={verificationCode.length !== 6}
            label="Verify email"
            onPress={() => {
              void (async () => {
                try {
                  const values = getValues();
                  const result = await verifySignupEmail(
                    environment.apiUrl,
                    values.email,
                    verificationCode,
                  );
                  if (!result.verificationToken)
                    throw new Error('Verification failed');
                  setVerificationToken(result.verificationToken);
                  setStep(3);
                } catch (error) {
                  setSubmitError(
                    error instanceof Error
                      ? error.message
                      : 'Unable to verify email.',
                  );
                }
              })();
            }}
          />
          <AuthLink
            label="Back to account details"
            onPress={() => setStep(1)}
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
