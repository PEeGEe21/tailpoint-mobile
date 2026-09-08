import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RuntimeStateProvider } from '@/providers/runtime-state-provider';
import { SessionBootstrapProvider } from '@/providers/session-bootstrap-provider';
import { queryClient } from '@/api/query-client';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RuntimeStateProvider>
          <SessionBootstrapProvider>{children}</SessionBootstrapProvider>
        </RuntimeStateProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
