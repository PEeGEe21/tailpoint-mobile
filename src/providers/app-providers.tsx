import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RuntimeStateProvider } from '@/providers/runtime-state-provider';
import { SessionBootstrapProvider } from '@/providers/session-bootstrap-provider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

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
