import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'tailpoint.auth.refresh-token.v1';

export interface SecureTokenStore {
  clearRefreshToken(): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
}

export const secureTokenStore: SecureTokenStore = {
  clearRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    }),
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
