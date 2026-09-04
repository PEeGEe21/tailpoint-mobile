import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';
import { AppState, Platform } from 'react-native';

export function RuntimeStateProvider({ children }: PropsWithChildren) {
  useEffect(
    () =>
      onlineManager.setEventListener((setOnline) =>
        NetInfo.addEventListener((state) =>
          setOnline(Boolean(state.isConnected)),
        ),
      ),
    [],
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  return children;
}
