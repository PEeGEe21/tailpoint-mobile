import type { SecureTokenStore } from '@/security/secure-token-store';
import type { SessionContextStore } from './session-context-store';
import { useSessionStore, type SessionContext } from './session-store';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface SessionManagerOptions {
  refresh(refreshToken: string): Promise<TokenPair>;
  resolveSessionContext(
    accessToken: string,
    persisted: SessionContext | null,
  ): Promise<SessionContext | null> | SessionContext | null;
  tokenStore: SecureTokenStore;
  contextStore: SessionContextStore;
}
export class SessionManager {
  private bootstrapPromise: Promise<boolean> | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  constructor(private readonly options: SessionManagerOptions) {}
  bootstrap() {
    if (!this.bootstrapPromise)
      this.bootstrapPromise = this.restoreSession().finally(() => {
        this.bootstrapPromise = null;
      });
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
  async establishSession(tokens: TokenPair, context: SessionContext) {
    await Promise.all([
      this.options.tokenStore.setRefreshToken(tokens.refreshToken),
      this.options.contextStore.set(context),
    ]);
    useSessionStore.getState().setAuthenticated(tokens.accessToken, context);
  }
  async clearSession() {
    await Promise.all([
      this.options.tokenStore.clearRefreshToken(),
      this.options.contextStore.clear(),
    ]);
    useSessionStore.getState().clear();
  }
  refreshAccessToken() {
    if (!this.refreshPromise)
      this.refreshPromise = this.rotateRefreshToken().finally(() => {
        this.refreshPromise = null;
      });
    return this.refreshPromise;
  }
  private async rotateRefreshToken() {
    const refreshToken = await this.options.tokenStore.getRefreshToken();
    if (!refreshToken) {
      useSessionStore.getState().clear();
      return null;
    }
    try {
      const [tokens, persisted] = await Promise.all([
        this.options.refresh(refreshToken),
        this.options.contextStore.get(),
      ]);
      const context = await this.options.resolveSessionContext(
        tokens.accessToken,
        persisted,
      );
      if (!context)
        throw new Error('Session organization context is unavailable');
      await this.establishSession(tokens, context);
      return tokens.accessToken;
    } catch (error) {
      await this.clearSession();
      throw error;
    }
  }
}
