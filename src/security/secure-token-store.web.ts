const REFRESH_TOKEN_KEY = 'tailpoint.auth.refresh-token.v1';

export interface SecureTokenStore {
  clearRefreshToken(): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
}

// Expo SecureStore is unavailable on web. Keep the web session in this tab's
// storage so refreshes work without persisting the refresh token indefinitely.
export const secureTokenStore: SecureTokenStore = {
  async clearRefreshToken() {
    globalThis.sessionStorage?.removeItem(REFRESH_TOKEN_KEY);
  },
  async getRefreshToken() {
    return globalThis.sessionStorage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  },
  async setRefreshToken(token) {
    globalThis.sessionStorage?.setItem(REFRESH_TOKEN_KEY, token);
  },
};

export class MemorySecureTokenStore implements SecureTokenStore {
  private refreshToken: string | null = null;

  async clearRefreshToken() {
    this.refreshToken = null;
  }

  async getRefreshToken() {
    return this.refreshToken;
  }

  async setRefreshToken(token: string) {
    this.refreshToken = token;
  }
}
