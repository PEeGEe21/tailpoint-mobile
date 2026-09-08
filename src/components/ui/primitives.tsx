import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Switch as NativeSwitch,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Button({
  children,
  disabled,
  ...props
}: PropsWithChildren<PressableProps>) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.primary,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
      {...props}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

export function IconButton({
  accessibilityLabel,
  children,
  ...props
}: PropsWithChildren<PressableProps> & { accessibilityLabel: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.iconButton,
        { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export function Field({
  error,
  label,
  rightElement,
  ...props
}: TextInputProps & {
  error?: string;
  label: string;
  rightElement?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View
        style={[
          styles.inputFrame,
          {
            borderColor: error ? theme.danger : theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          {...props}
        />
        {rightElement}
      </View>
      {error ? (
        <ThemedText style={{ color: theme.danger }} type="small">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function Choice({
  checked,
  label,
  onPress,
  radio = false,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
  radio?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.choice}
    >
      <View
        style={[
          radio ? styles.radio : styles.checkbox,
          {
            borderColor: checked ? theme.primary : theme.border,
            backgroundColor: checked ? theme.primary : 'transparent',
          },
        ]}
      />
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

export function Switch({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.switchRow}>
      <ThemedText>{label}</ThemedText>
      <NativeSwitch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        trackColor={{ true: theme.primary }}
        value={value}
      />
    </View>
  );
}

export function Card({
  children,
  style,
  ...props
}: PropsWithChildren<ViewProps>) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function ListItem({
  leading,
  subtitle,
  title,
  trailing,
}: {
  leading?: ReactNode;
  subtitle?: string;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.listItem}>
      {leading}
      <View style={styles.grow}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' | 'danger' }>) {
  const theme = useTheme();
  const color = tone === 'neutral' ? theme.textSecondary : theme[tone];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {children}
      </ThemedText>
    </View>
  );
}

export function Avatar({ label }: { label: string }) {
  const theme = useTheme();
  const initials = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <View
      accessibilityLabel={label}
      style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}
    >
      <ThemedText type="smallBold">{initials}</ThemedText>
    </View>
  );
}

export function Progress({ value }: { value: number }) {
  const theme = useTheme();
  const bounded = Math.max(0, Math.min(1, value));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(bounded * 100) }}
      style={[styles.track, { backgroundColor: theme.border }]}
    >
      <View
        style={[
          styles.fill,
          { backgroundColor: theme.primary, width: `${bounded * 100}%` },
        ]}
      />
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.border,
      }}
    />
  );
}
export function Skeleton({
  height = 16,
  width = '100%',
}: {
  height?: number;
  width?: number | `${number}%`;
}) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel="Loading"
      style={{
        height,
        width,
        borderRadius: Radius.small,
        backgroundColor: theme.backgroundSelected,
      }}
    />
  );
}
export function Spinner() {
  const theme = useTheme();
  return (
    <ActivityIndicator accessibilityLabel="Loading" color={theme.primary} />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Figtree',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.medium,
  },
  field: { gap: Spacing.one },
  inputFrame: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  choice: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderRadius: 6 },
  radio: { width: 22, height: 22, borderWidth: 6, borderRadius: Radius.pill },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  listItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: { flex: 1 },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  track: { height: 8, overflow: 'hidden', borderRadius: Radius.pill },
  fill: { height: '100%' },
});
