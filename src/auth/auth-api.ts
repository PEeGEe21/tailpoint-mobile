import createClient from 'openapi-fetch';

import type { paths } from '@/api/generated/schema';

import type { TokenPair } from './session-manager';
import type {
  SessionContext,
  SessionOrganization,
  SessionUser,
} from './session-store';
import { normalizeApiError, type NormalizedApiError } from '@/api/errors';

export type SignInResult =
  | { kind: 'authenticated'; context: SessionContext; tokens: TokenPair }
  | { kind: 'organization-selection'; organizations: SessionOrganization[] };
const organizationFromApi = (value: {
  id: string;
  name: string;
  slug: string;
  role?: string | null;
  onboarding_complete?: boolean;
}): SessionOrganization => ({
  id: value.id,
  name: value.name,
  slug: value.slug,
  role: value.role,
  onboardingComplete: value.onboarding_complete,
});
const userFromApi = (value: Record<string, unknown>): SessionUser => ({
  id: Number(value.id),
  email: String(value.email ?? ''),
  firstName:
    typeof value.first_name === 'string'
      ? value.first_name
      : typeof value.firstName === 'string'
        ? value.firstName
        : undefined,
  lastName:
    typeof value.last_name === 'string'
      ? value.last_name
      : typeof value.lastName === 'string'
        ? value.lastName
        : undefined,
  role: typeof value.role === 'string' ? value.role : undefined,
});
const apiFailure = (status: number, error: unknown): NormalizedApiError =>
  normalizeApiError(status, error);

export async function signIn(
  baseUrl: string,
  email: string,
  password: string,
  organizationId?: string,
): Promise<SignInResult> {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST('/api/auth/login', {
    body: {
      email: email.trim().toLowerCase(),
      password,
      organization_id: organizationId,
    },
  });
  if (!data) throw apiFailure(response.status, error);
  if ('requiresOrganizationSelection' in data)
    return {
      kind: 'organization-selection',
      organizations: data.organizations.map(organizationFromApi),
    };
  const organization = organizationFromApi(data.organization);
  return {
    kind: 'authenticated',
    tokens: data.token,
    context: {
      user: userFromApi(data.user),
      organization,
      organizationRole: data.organizationRole ?? organization.role ?? null,
      organizations: (data.allOrganizations ?? [data.organization]).map(
        organizationFromApi,
      ),
    },
  };
}

export async function refreshSession(
  baseUrl: string,
  refreshToken: string,
): Promise<TokenPair> {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST('/api/auth/refresh', {
    body: { refreshToken },
  });

  if (!data) {
    throw apiFailure(response.status, error);
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
