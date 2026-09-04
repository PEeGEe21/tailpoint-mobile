import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeedbackVariant =
  'empty' | 'error' | 'forbidden' | 'loading' | 'not-found' | 'offline';

type FeedbackStateProps = {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
  variant: FeedbackVariant;
};

export function FeedbackState({
  actionLabel,
  description,
  onAction,
  title,
  variant,
}: FeedbackStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      style={styles.container}
    >
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>
        {description}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={[styles.action, { borderColor: theme.border }]}
        >
          <ThemedText type="smallBold">{actionLabel}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: { textAlign: 'center', fontSize: 22, lineHeight: 28 },
  description: { textAlign: 'center', maxWidth: 420 },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
});
