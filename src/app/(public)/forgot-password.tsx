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

type Step = 'request' | 'verify' | 'reset';
const STEP_NUMBER: Record<Step, number> = { request: 1, verify: 2, reset: 3 };

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('request');
  const { control, handleSubmit, trigger, setValue } =
    useForm<PasswordRecoveryForm>({
      defaultValues: { email: '', code: '', password: '', confirmPassword: '' },
      resolver: zodResolver(passwordRecoverySchema),
      mode: 'onTouched',
    });
  const email = useWatch({ control, name: 'email' });
  const advance = async () => {
    if (step === 'request') {
      if (await trigger('email')) setStep('verify');
      return;
    }
    if (step === 'verify') {
      if (await trigger('code')) setStep('reset');
      return;
    }
    await handleSubmit(() => router.replace('/(public)/sign-in'))();
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
          <AuthLink
            label="Send a new code"
            onPress={() => setValue('code', '')}
          />
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
      <AuthPrimaryButton
        label={
          step === 'request'
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
