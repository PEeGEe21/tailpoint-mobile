import createClient from 'openapi-fetch';

import type { paths } from '@/api/generated/schema';

import type { TokenPair } from './session-manager';

export async function refreshSession(
  baseUrl: string,
  refreshToken: string,
): Promise<TokenPair> {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST('/api/auth/refresh', {
    body: { refreshToken },
  });

  if (!data) {
    throw Object.assign(new Error('Session refresh failed'), {
      cause: error,
      status: response.status,
    });
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
