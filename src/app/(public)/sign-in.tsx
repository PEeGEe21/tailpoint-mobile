import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';

import { Choice } from '@/components/ui/primitives';
import { ThemedText } from '@/components/themed-text';
import {
  AuthFooter,
  AuthLink,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/auth-shell';
import { FormField, PasswordFormField } from '@/features/auth/form-field';
import { signInSchema, type SignInForm } from '@/features/auth/schemas';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DEFAULT_VALUES: SignInForm = {
  email: '',
  password: '',
  trustDevice: true,
};

export default function SignInScreen() {
  const theme = useTheme();
  const { control, handleSubmit, setValue } = useForm<SignInForm>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
  });
  const trustDevice = useWatch({ control, name: 'trustDevice' });
  const submit = handleSubmit(() => {
    // Local-only handoff until API integration is enabled.
    router.replace('/(onboarding)/choose-workspace');
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      footer={
        <View style={styles.footerStack}>
          <AuthFooter
            action="Create an organization"
            label="New to Tailpoint?"
            onPress={() => router.replace('/(public)/sign-up')}
          />
          <AuthLink
            label="Have an invitation? Join your organization"
            onPress={() => router.replace('/(public)/join-org')}
          />
        </View>
      }
      subtitle="Use your work account to continue to your organization."
      title="Sign in to Tailpoint"
    >
      <FormField
        autoCapitalize="none"
        autoComplete="email"
        control={control}
        keyboardType="email-address"
        label="Work email"
        name="email"
        returnKeyType="next"
      />

      <View style={styles.passwordBlock}>
        <View style={styles.passwordHeader}>
          <AuthLink
            label="Forgot password?"
            onPress={() => router.push('/(public)/forgot-password')}
          />
        </View>
        <PasswordFormField
          autoCapitalize="none"
          autoComplete="current-password"
          control={control}
          label="Password"
          name="password"
          onSubmitEditing={() => void submit()}
        />
      </View>

      <Choice
        checked={trustDevice}
        label="Trust this device for 30 days"
        onPress={() => setValue('trustDevice', !trustDevice)}
      />

      <AuthPrimaryButton label="Sign in" onPress={() => void submit()} />

      {/* <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText style={styles.dividerLabel} themeColor="textSecondary">
          or
        </ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View> */}

      {/* <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        disabled
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            borderColor: theme.border,
            backgroundColor: theme.background,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Building2 color={theme.primary} size={20} />
        <ThemedText type="smallBold">SSO / Passkey coming soon</ThemedText>
      </Pressable> */}

      <View
        style={[
          styles.securityNote,
          { backgroundColor: theme.backgroundSelected },
        ]}
      >
        <ShieldCheck color={theme.success} size={20} />
        <ThemedText
          style={styles.securityText}
          type="small"
          themeColor="textSecondary"
        >
          Your session credentials are stored securely on this device.
        </ThemedText>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footerStack: { alignItems: 'center', gap: Spacing.three },
  passwordBlock: { gap: Spacing.one },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: 12, textTransform: 'uppercase' },
  secondaryButton: {
    width: '100%',
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  securityNote: {
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  securityText: { flex: 1 },
});
