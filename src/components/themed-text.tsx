import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { AppFonts, ThemeColor, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily: AppFonts.sans },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    ...Typography.small,
    fontWeight: 500,
  },
  smallBold: {
    ...Typography.small,
    fontWeight: 700,
  },
  default: {
    ...Typography.body,
    fontWeight: 500,
  },
  title: {
    ...Typography.display,
    fontWeight: 600,
  },
  subtitle: {
    ...Typography.heading,
    fontWeight: 600,
  },
  link: {
    ...Typography.small,
  },
  linkPrimary: {
    ...Typography.small,
    color: '#3c87f7',
  },
  code: {
    fontFamily: AppFonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    ...Typography.caption,
  },
});
