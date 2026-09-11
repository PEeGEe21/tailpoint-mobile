import { PropsWithChildren, useEffect } from 'react';

import { sessionManager } from '@/auth/runtime-session';
import { useSessionStore } from '@/auth/session-store';

export function SessionBootstrapProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    void sessionManager.bootstrap().catch(() => {
      // Never leave routing behind a permanent blank bootstrapping state when
      // platform storage is unavailable or corrupt.
      useSessionStore.getState().clear();
    });
  }, []);

  return children;
}
