import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from './generated/schema';

export interface ApiClientContext {
  getAccessToken(): Promise<string | null> | string | null;
  getOrganizationId(): Promise<string | null> | string | null;
}

export interface CreateApiClientOptions extends ApiClientContext {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  refreshAccessToken?(): Promise<string | null>;
}

export function createTailpointApiClient({
  baseUrl,
  fetch,
  getAccessToken,
  getOrganizationId,
  refreshAccessToken,
}: CreateApiClientOptions) {
  const client = createClient<paths>({ baseUrl, fetch });

  const contextMiddleware: Middleware = {
    async onRequest({ request }) {
      const [accessToken, organizationId] = await Promise.all([
        getAccessToken(),
        getOrganizationId(),
      ]);
      const headers = new Headers(request.headers);

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      if (organizationId) {
        headers.set('X-Organization-ID', organizationId);
      }

      return new Request(request, { headers });
    },
  };

  client.use(contextMiddleware);

  if (refreshAccessToken) {
    client.use({
      async onResponse({ request, response, options }) {
        if (response.status !== 401) return response;

        try {
          const accessToken = await refreshAccessToken();
          if (!accessToken) return response;

          const headers = new Headers(request.headers);
          headers.set('Authorization', `Bearer ${accessToken}`);
          return options.fetch(new Request(request, { headers }));
        } catch {
          return response;
        }
      },
    });
  }

  return client;
}

export type TailpointApiClient = ReturnType<typeof createTailpointApiClient>;
