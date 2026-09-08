import { jwtDecode } from 'jwt-decode';

import { createTailpointApiClient } from '@/api/client';
import { environment } from '@/config/env';
import { secureTokenStore } from '@/security/secure-token-store';
import { sessionContextStore } from './session-context-store';

import { refreshSession } from './auth-api';
import { SessionManager } from './session-manager';
import { useSessionStore } from './session-store';

interface AccessTokenClaims {
  sub: number;
  email: string;
  role?: string;
  currentOrganizationId?: string | null;
  organizationRole?: string | null;
}

export const sessionManager = new SessionManager({
  refresh: (refreshToken) => refreshSession(environment.apiUrl, refreshToken),
  resolveSessionContext: (accessToken, persisted) => {
    const claims = jwtDecode<AccessTokenClaims>(accessToken);
    if (
      !persisted ||
      persisted.user.id !== Number(claims.sub) ||
      persisted.organization.id !== claims.currentOrganizationId
    )
      return null;
    return {
      ...persisted,
      organizationRole: claims.organizationRole ?? persisted.organizationRole,
      user: {
        ...persisted.user,
        email: claims.email,
        role: claims.role ?? persisted.user.role,
      },
    };
  },
  tokenStore: secureTokenStore,
  contextStore: sessionContextStore,
});

export const apiClient = createTailpointApiClient({
  baseUrl: environment.apiUrl,
  getAccessToken: () => useSessionStore.getState().accessToken,
  getOrganizationId: () => useSessionStore.getState().organizationId,
  refreshAccessToken: () => sessionManager.refreshAccessToken(),
});
