import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  type PressableProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function AuthShell({
  children,
  eyebrow = 'Tailpoint',
  footer,
  subtitle,
  title,
}: PropsWithChildren<{
  eyebrow?: string;
  footer?: ReactNode;
  subtitle: string;
  title: string;
}>) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.grow}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/(public)/welcome')
            }
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.55 : 1 },
            ]}
          >
            <ArrowLeft color={theme.text} size={23} />
          </Pressable>
          <ThemedText style={styles.wordmark}>Tailpoint</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <ThemedText style={[styles.eyebrow, { color: theme.primary }]}>
              {eyebrow}
            </ThemedText>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle} themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            {children}
          </View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress}>
      {({ pressed }) => (
        <ThemedText
          style={[
            styles.link,
            { color: theme.primary, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

export function AuthPrimaryButton({
  disabled,
  label,
  style,
  ...props
}: Omit<PressableProps, 'children'> & { label: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.primaryHitTarget,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.primaryButton,
            {
              backgroundColor: theme.primary,
              opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
            },
          ]}
        >
          <Text style={styles.primaryButtonLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function AuthFooter({
  action,
  label,
  onPress,
}: {
  action: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.footerRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <AuthLink label={action} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  grow: { flex: 1 },
  header: {
    height: 58,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  wordmark: { fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 44 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  intro: { gap: Spacing.two, marginBottom: Spacing.four },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 22 },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: 1,
  },
  footer: { alignItems: 'center', marginTop: Spacing.four },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  link: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  primaryHitTarget: {
    width: '100%',
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
