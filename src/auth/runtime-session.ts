import { jwtDecode } from 'jwt-decode';

import { createTailpointApiClient } from '@/api/client';
import { environment } from '@/config/env';
import { secureTokenStore } from '@/security/secure-token-store';

import { refreshSession } from './auth-api';
import { SessionManager } from './session-manager';
import { useSessionStore } from './session-store';

interface AccessTokenClaims {
  currentOrganizationId?: string | null;
}

export const sessionManager = new SessionManager({
  refresh: (refreshToken) => refreshSession(environment.apiUrl, refreshToken),
  resolveOrganizationId: (accessToken) =>
    jwtDecode<AccessTokenClaims>(accessToken).currentOrganizationId ?? null,
  tokenStore: secureTokenStore,
});

export const apiClient = createTailpointApiClient({
  baseUrl: environment.apiUrl,
  getAccessToken: () => useSessionStore.getState().accessToken,
  getOrganizationId: () => useSessionStore.getState().organizationId,
  refreshAccessToken: () => sessionManager.refreshAccessToken(),
});
