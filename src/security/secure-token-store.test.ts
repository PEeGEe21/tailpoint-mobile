import { MemorySecureTokenStore } from '@/security/secure-token-store';

describe('secure token store contract', () => {
  it('stores and clears a refresh token', async () => {
    const store = new MemorySecureTokenStore();

    await store.setRefreshToken('refresh-token');
    expect(await store.getRefreshToken()).toBe('refresh-token');

    await store.clearRefreshToken();
    expect(await store.getRefreshToken()).toBeNull();
  });
});
