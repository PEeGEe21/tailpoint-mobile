import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import '@/styles.css';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import '@/config/env';
import { useEffectiveColorScheme } from '@/hooks/use-theme';
import { AppProviders } from '@/providers/app-providers';
import { useAppearanceStore } from '@/state/appearance-store';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 450, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree: require('../../assets/fonts/Figtree-Variable.ttf'),
  });
  const hasHydrated = useAppearanceStore((state) => state.hasHydrated);
  const colorScheme = useEffectiveColorScheme();

  useEffect(() => {
    if (hasHydrated && (fontsLoaded || fontError)) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded, hasHydrated]);

  if (!hasHydrated || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <AppProviders>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </AppProviders>
    </AppErrorBoundary>
  );
}
