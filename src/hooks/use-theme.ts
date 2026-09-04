/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppearanceStore } from '@/state/appearance-store';

export function resolveAppearance(
  preference: 'system' | 'light' | 'dark',
  systemScheme: string | null | undefined,
) {
  return preference === 'system'
    ? systemScheme === 'dark'
      ? 'dark'
      : 'light'
    : preference;
}

export function useEffectiveColorScheme() {
  const systemScheme = useColorScheme();
  const preference = useAppearanceStore((state) => state.preference);

  return resolveAppearance(preference, systemScheme);
}

export function useTheme() {
  return Colors[useEffectiveColorScheme()];
}
