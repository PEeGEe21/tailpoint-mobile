import type { SecureTokenStore } from '@/security/secure-token-store';

import { useSessionStore } from './session-store';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionManagerOptions {
  refresh(refreshToken: string): Promise<TokenPair>;
  resolveOrganizationId(
    accessToken: string,
  ): Promise<string | null> | string | null;
  tokenStore: SecureTokenStore;
}

export class SessionManager {
  private bootstrapPromise: Promise<boolean> | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(private readonly options: SessionManagerOptions) {}

  bootstrap() {
    if (!this.bootstrapPromise) {
      this.bootstrapPromise = this.restoreSession().finally(() => {
        this.bootstrapPromise = null;
      });
    }

    return this.bootstrapPromise;
  }

  private async restoreSession() {
    useSessionStore.getState().setBootstrapping();
    const refreshToken = await this.options.tokenStore.getRefreshToken();

    if (!refreshToken) {
      useSessionStore.getState().clear();
      return false;
    }

    return (await this.refreshAccessToken()) !== null;
  }

  async establishSession(tokens: TokenPair, organizationId: string | null) {
    await this.options.tokenStore.setRefreshToken(tokens.refreshToken);
    useSessionStore
      .getState()
      .setAuthenticated(tokens.accessToken, organizationId);
  }

  async clearSession() {
    await this.options.tokenStore.clearRefreshToken();
    useSessionStore.getState().clear();
  }

  refreshAccessToken() {
    if (!this.refreshPromise) {
      this.refreshPromise = this.rotateRefreshToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async rotateRefreshToken() {
    const refreshToken = await this.options.tokenStore.getRefreshToken();
    if (!refreshToken) {
      useSessionStore.getState().clear();
      return null;
    }

    try {
      const tokens = await this.options.refresh(refreshToken);
      const organizationId = await this.options.resolveOrganizationId(
        tokens.accessToken,
      );
      await this.establishSession(tokens, organizationId);
      return tokens.accessToken;
    } catch (error) {
      await this.clearSession();
      throw error;
    }
  }
}
