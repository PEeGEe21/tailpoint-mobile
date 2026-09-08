/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#122033',
    background: '#F6F8FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E4F4F3',
    textSecondary: '#667085',
    primary: '#008080',
    primarySoft: '#DDF4F1',
    ink: '#102A43',
    info: '#2D8CFF',
    accent: '#F2B84B',
    onPrimary: '#FFFFFF',
    border: '#E4E9F0',
    success: '#14804A',
    warning: '#D97706',
    danger: '#D92D20',
    onDanger: '#FFFFFF',
  },
  dark: {
    text: '#F5F8FC',
    background: '#0B1220',
    backgroundElement: '#111B2E',
    backgroundSelected: '#173C46',
    textSecondary: '#AAB6C8',
    primary: '#35B8B2',
    primarySoft: '#173C46',
    ink: '#07111F',
    info: '#68B5FF',
    accent: '#F6C861',
    onPrimary: '#07111F',
    border: '#29364B',
    success: '#43C47B',
    warning: '#F6B94A',
    danger: '#FF776D',
    onDanger: '#0B1220',
  },
} as const;

/** Extended semantic palette used by public authentication surfaces. */
export const AuthColors = {
  light: {
    brand: Colors.light.primary,
    brandPressed: '#006B6B',
    brandDark: '#006565',
    brandBlue: '#0294E2',
    canvas: Colors.light.background,
    surface: Colors.light.backgroundElement,
    surfaceLow: '#F0F3FF',
    surfaceHigh: '#DDE9FF',
    surfaceHighest: '#D5E3FD',
    textStrong: Colors.light.text,
    textMuted: Colors.light.textSecondary,
    border: Colors.light.border,
    outline: '#6E7979',
    success: Colors.light.success,
    danger: Colors.light.danger,
    tertiary: '#597E00',
    switchOff: '#D5E3FD',
  },
  dark: {
    brand: Colors.dark.primary,
    brandPressed: '#249C97',
    brandDark: Colors.dark.primary,
    brandBlue: '#55B8EC',
    canvas: Colors.dark.background,
    surface: Colors.dark.backgroundElement,
    surfaceLow: '#162238',
    surfaceHigh: '#1B2940',
    surfaceHighest: '#29364B',
    textStrong: Colors.dark.text,
    textMuted: Colors.dark.textSecondary,
    border: Colors.dark.border,
    outline: '#AAB6C8',
    success: Colors.dark.success,
    danger: Colors.dark.danger,
    tertiary: '#BCEB55',
    switchOff: '#29364B',
  },
} as const;

export type AuthTheme = (typeof AuthColors)[keyof typeof AuthColors];

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const AppFonts = {
  sans: 'Figtree',
  mono: Fonts.mono,
} as const;

export const Typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  small: { fontSize: 14, lineHeight: 20 },
  body: { fontSize: 16, lineHeight: 24 },
  heading: { fontSize: 24, lineHeight: 32 },
  display: { fontSize: 40, lineHeight: 48 },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 20,
  sheet: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
