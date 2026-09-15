import type { SecureTokenStore } from '@/security/secure-token-store';
import type { SessionContextStore } from './session-context-store';
import {
  useSessionStore,
  type SessionContext,
  type SessionUser,
} from './session-store';

export interface AccountSessionContext {
  user: SessionUser;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface SessionManagerOptions {
  refresh(refreshToken: string): Promise<TokenPair>;
  resolveSessionContext(
    accessToken: string,
    persisted: SessionContext | null,
  ):
    | Promise<SessionContext | AccountSessionContext | null>
    | SessionContext
    | AccountSessionContext
    | null;
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
  async establishAccountSession(tokens: TokenPair, user: SessionUser) {
    await Promise.all([
      this.options.tokenStore.setRefreshToken(tokens.refreshToken),
      this.options.contextStore.clear(),
    ]);
    useSessionStore.getState().setWorkspaceRequired(tokens.accessToken, user);
  }
  async clearSession() {
    await Promise.all([
      this.options.tokenStore.clearRefreshToken(),
      this.options.contextStore.clear(),
    ]);
    useSessionStore.getState().clear();
  }
  async removeUnavailableOrganization(organizationId: string) {
    const state = useSessionStore.getState();
    if (
      !state.accessToken ||
      !state.user ||
      !state.organization ||
      state.organization.id === organizationId
    ) {
      return;
    }
    const context: SessionContext = {
      user: state.user,
      organization: state.organization,
      organizationRole: state.organizationRole,
      organizations: state.organizations.filter(
        (organization) => organization.id !== organizationId,
      ),
    };
    await this.options.contextStore.set(context);
    useSessionStore.getState().setAuthenticated(state.accessToken, context);
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
      if ('organization' in context) {
        await this.establishSession(tokens, context);
      } else {
        await this.establishAccountSession(tokens, context.user);
      }
      return tokens.accessToken;
    } catch (error) {
      await this.clearSession();
      throw error;
    }
  }
}
