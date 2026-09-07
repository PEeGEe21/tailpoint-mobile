import { MemorySecureTokenStore } from '@/security/secure-token-store';

import { SessionManager } from './session-manager';
import { useSessionStore } from './session-store';

describe('SessionManager', () => {
  beforeEach(() => useSessionStore.getState().clear());

  it('restores a session by rotating the stored refresh token', async () => {
    const tokenStore = new MemorySecureTokenStore();
    await tokenStore.setRefreshToken('old-refresh');
    const refresh = jest.fn().mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    const manager = new SessionManager({
      refresh,
      resolveOrganizationId: () => 'org-1',
      tokenStore,
    });

    await expect(manager.bootstrap()).resolves.toBe(true);
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
    const refresh = jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'rotated',
    });
    const manager = new SessionManager({
      refresh,
      resolveOrganizationId: () => null,
      tokenStore,
    });

    await expect(
      Promise.all([
        manager.refreshAccessToken(),
        manager.refreshAccessToken(),
        manager.refreshAccessToken(),
      ]),
    ).resolves.toEqual(['access', 'access', 'access']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('clears credentials when refresh is rejected', async () => {
    const tokenStore = new MemorySecureTokenStore();
    await tokenStore.setRefreshToken('invalid');
    const manager = new SessionManager({
      refresh: jest.fn().mockRejectedValue(new Error('unauthorized')),
      resolveOrganizationId: () => null,
      tokenStore,
    });

    await expect(manager.bootstrap()).rejects.toThrow('unauthorized');
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(useSessionStore.getState().status).toBe('unauthenticated');
  });
});
