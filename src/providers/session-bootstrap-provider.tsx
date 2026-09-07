import { PropsWithChildren, useEffect } from 'react';

import { sessionManager } from '@/auth/runtime-session';

export function SessionBootstrapProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    void sessionManager.bootstrap().catch(() => {
      // SessionManager clears invalid credentials. Routing observes the
      // resulting unauthenticated state; bootstrap errors are not rendered here.
    });
  }, []);

  return children;
}
