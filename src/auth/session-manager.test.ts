import { MemorySecureTokenStore } from '@/security/secure-token-store';
import type { SessionContextStore } from './session-context-store';
import { SessionManager } from './session-manager';
import { useSessionStore, type SessionContext } from './session-store';

const context: SessionContext = {
  user: { id: 1, email: 'ada@example.com' },
  organization: { id: 'org-1', name: 'Acme', slug: 'acme' },
  organizationRole: 'member',
  organizations: [{ id: 'org-1', name: 'Acme', slug: 'acme' }],
};
class MemoryContextStore implements SessionContextStore {
  value: SessionContext | null = context;
  async get() {
    return this.value;
  }
  async set(value: SessionContext) {
    this.value = value;
  }
  async clear() {
    this.value = null;
  }
}
const createManager = (
  tokenStore: MemorySecureTokenStore,
  refresh: jest.Mock,
) =>
  new SessionManager({
    refresh,
    resolveSessionContext: (_token, persisted) => persisted,
    tokenStore,
    contextStore: new MemoryContextStore(),
  });

describe('SessionManager', () => {
  beforeEach(() => useSessionStore.getState().clear());
  it('restores a session by rotating the stored refresh token and context', async () => {
    const tokenStore = new MemorySecureTokenStore();
    await tokenStore.setRefreshToken('old-refresh');
    const refresh = jest.fn().mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    await expect(createManager(tokenStore, refresh).bootstrap()).resolves.toBe(
      true,
    );
    expect(refresh).toHaveBeenCalledWith('old-refresh');
    await expect(tokenStore.getRefreshToken()).resolves.toBe('new-refresh');
    expect(useSessionStore.getState()).toMatchObject({
      accessToken: 'new-access',
      organizationId: 'org-1',
      status: 'authenticated',
    });
  });
  it('uses one refresh request for concurrent callers', async () => {
    const tokenStore = new MemorySecureTokenStore();
    await tokenStore.setRefreshToken('refresh');
    const refresh = jest
      .fn()
      .mockResolvedValue({ accessToken: 'access', refreshToken: 'rotated' });
    const manager = createManager(tokenStore, refresh);
    await expect(
      Promise.all([
        manager.refreshAccessToken(),
        manager.refreshAccessToken(),
        manager.refreshAccessToken(),
      ]),
    ).resolves.toEqual(['access', 'access', 'access']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('clears credentials and context when refresh is rejected', async () => {
    const tokenStore = new MemorySecureTokenStore();
    await tokenStore.setRefreshToken('invalid');
    const manager = createManager(
      tokenStore,
      jest.fn().mockRejectedValue(new Error('unauthorized')),
    );
    await expect(manager.bootstrap()).rejects.toThrow('unauthorized');
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});
