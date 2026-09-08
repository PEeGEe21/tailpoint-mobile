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
import { useSessionStore } from '@/auth/session-store';

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
          <AuthenticatedStack />
        </ThemeProvider>
      </AppProviders>
    </AppErrorBoundary>
  );
}

function AuthenticatedStack() {
  const status = useSessionStore((state) => state.status);
  if (status === 'bootstrapping') return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'unauthenticated'}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'selecting-organization'}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'authenticated'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
