import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { Progress } from '@/components/ui/primitives';
import {
  AuthFooter,
  AuthLink,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/auth-shell';
import { FormField, PasswordFormField } from '@/features/auth/form-field';
import {
  passwordRecoverySchema,
  type PasswordRecoveryForm,
} from '@/features/auth/schemas';
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from '@/auth/auth-api';
import { environment } from '@/config/env';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Step = 'request' | 'verify' | 'reset';
const STEP_NUMBER: Record<Step, number> = { request: 1, verify: 2, reset: 3 };

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('request');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { control, getValues, handleSubmit, trigger, setValue } =
    useForm<PasswordRecoveryForm>({
      defaultValues: { email: '', code: '', password: '', confirmPassword: '' },
      resolver: zodResolver(passwordRecoverySchema),
      mode: 'onTouched',
    });
  const email = useWatch({ control, name: 'email' });
  const advance = async () => {
    setSubmitError(null);
    setMessage(null);
    if (step === 'request') {
      if (!(await trigger('email'))) return;
      setPending(true);
      try {
        const result = await requestPasswordReset(environment.apiUrl, email);
        setMessage(result.message);
        setStep('verify');
      } catch (error) {
        setSubmitError(
          errorMessage(error, 'Unable to request a verification code.'),
        );
      } finally {
        setPending(false);
      }
      return;
    }
    if (step === 'verify') {
      if (!(await trigger('code'))) return;
      setPending(true);
      try {
        const values = getValues();
        await verifyPasswordResetCode(
          environment.apiUrl,
          values.email,
          values.code,
        );
        setStep('reset');
      } catch (error) {
        setSubmitError(
          errorMessage(error, 'The verification code could not be confirmed.'),
        );
      } finally {
        setPending(false);
      }
      return;
    }
    await handleSubmit(async (values) => {
      setPending(true);
      try {
        await resetPassword(environment.apiUrl, values.email, values.password);
        router.replace('/(public)/sign-in');
      } catch (error) {
        setSubmitError(errorMessage(error, 'Unable to reset your password.'));
      } finally {
        setPending(false);
      }
    })();
  };
  const resend = async () => {
    setValue('code', '');
    setSubmitError(null);
    setPending(true);
    try {
      const result = await requestPasswordReset(environment.apiUrl, email);
      setMessage(result.message);
    } catch (error) {
      setSubmitError(errorMessage(error, 'Unable to send a new code.'));
    } finally {
      setPending(false);
    }
  };
  const title =
    step === 'request'
      ? 'Reset your password'
      : step === 'verify'
        ? 'Check your email'
        : 'Choose a new password';
  const subtitle =
    step === 'request'
      ? 'We’ll send a verification code to your account email.'
      : step === 'verify'
        ? `Enter the six-digit code sent to ${email}.`
        : 'Your new password must contain at least eight characters.';

  return (
    <AuthShell
      eyebrow={`Account recovery · Step ${STEP_NUMBER[step]} of 3`}
      footer={
        <AuthFooter
          label="Remembered your password?"
          action="Sign in"
          onPress={() => router.replace('/(public)/sign-in')}
        />
      }
      subtitle={subtitle}
      title={title}
    >
      <Progress value={STEP_NUMBER[step] / 3} />
      {step === 'request' ? (
        <FormField
          control={control}
          name="email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Work email"
          onSubmitEditing={() => void advance()}
        />
      ) : null}
      {step === 'verify' ? (
        <>
          <FormField
            control={control}
            name="code"
            autoCapitalize="none"
            keyboardType="number-pad"
            label="Verification code"
            maxLength={6}
            normalize={(value) => value.replace(/\D/g, '')}
            onSubmitEditing={() => void advance()}
          />
          <AuthLink label="Send a new code" onPress={() => void resend()} />
        </>
      ) : null}
      {step === 'reset' ? (
        <>
          <PasswordFormField
            control={control}
            name="password"
            autoCapitalize="none"
            autoComplete="new-password"
            label="New password"
          />
          <PasswordFormField
            control={control}
            name="confirmPassword"
            autoCapitalize="none"
            label="Confirm new password"
            onSubmitEditing={() => void advance()}
          />
        </>
      ) : null}
      {message ? (
        <ThemedText type="small" style={{ color: theme.success }}>
          {message}
        </ThemedText>
      ) : null}
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
        disabled={pending}
        label={
          pending
            ? 'Please wait…'
            : step === 'request'
              ? 'Send verification code'
              : step === 'verify'
                ? 'Verify code'
                : 'Reset password'
        }
        onPress={() => void advance()}
      />
    </AuthShell>
  );
}

function errorMessage(error: unknown, fallback: string) {
  return error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
    ? error.message
    : fallback;
}
