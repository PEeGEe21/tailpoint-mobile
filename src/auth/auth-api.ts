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
  | { kind: 'organization-selection'; organizations: SessionOrganization[] }
  | { kind: 'workspace-required'; user: SessionUser; tokens: TokenPair };
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
const signupResult = (data: {
  user: Record<string, unknown>;
  organization: Parameters<typeof organizationFromApi>[0];
  token: TokenPair;
}): Extract<SignInResult, { kind: 'authenticated' }> => {
  const organization = organizationFromApi(data.organization);
  return {
    kind: 'authenticated',
    tokens: data.token,
    context: {
      user: userFromApi(data.user),
      organization,
      organizationRole: organization.role ?? null,
      organizations: [organization],
    },
  };
};

export async function createOrganizationAccount(
  baseUrl: string,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    verificationToken: string;
  },
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST(
    '/api/auth/signup/create-organization',
    {
      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        organization_name: input.organizationName.trim(),
        verification_token: input.verificationToken,
      },
    },
  );
  if (!data) throw apiFailure(response.status, error);
  return signupResult(data);
}

export async function requestSignupEmailVerification(
  baseUrl: string,
  email: string,
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST(
    '/api/auth/signup/request-email-verification',
    { body: { email: email.trim().toLowerCase() } },
  );
  if (!data) throw apiFailure(response.status, error);
  return data;
}

export async function verifySignupEmail(
  baseUrl: string,
  email: string,
  code: string,
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST(
    '/api/auth/signup/verify-email',
    { body: { email: email.trim().toLowerCase(), code } },
  );
  if (!data) throw apiFailure(response.status, error);
  return data;
}

export async function validateInvitation(
  baseUrl: string,
  credential: { code?: string; token?: string },
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.GET(
    '/api/auth/validate-invitation',
    { params: { query: credential } },
  );
  if (!data) throw apiFailure(response.status, error);
  return {
    email: data.email,
    invitedRole: data.invited_role,
    organization: organizationFromApi(data.organization),
  };
}

export async function joinOrganizationAccount(
  baseUrl: string,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    inviteCode?: string;
    inviteToken?: string;
  },
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.POST(
    '/api/auth/signup/join-organization',
    {
      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        invite_code: input.inviteCode?.trim() || undefined,
        invite_token: input.inviteToken?.trim() || undefined,
      },
    },
  );
  if (!data) throw apiFailure(response.status, error);
  return signupResult(data);
}

async function passwordRecoveryRequest(
  baseUrl: string,
  path: '/api/auth/forgot-password' | '/api/auth/verify-forgot-password-otp',
  body: { email: string; otp?: string },
) {
  const client = createClient<paths>({ baseUrl });
  const result =
    path === '/api/auth/forgot-password'
      ? await client.POST(path, { body: { email: body.email } })
      : await client.POST(path, {
          body: { email: body.email, otp: body.otp ?? '' },
        });
  if (!result.data) throw apiFailure(result.response.status, result.error);
  return result.data;
}

export const requestPasswordReset = (baseUrl: string, email: string) =>
  passwordRecoveryRequest(baseUrl, '/api/auth/forgot-password', {
    email: email.trim().toLowerCase(),
  });
export const verifyPasswordResetCode = (
  baseUrl: string,
  email: string,
  otp: string,
) =>
  passwordRecoveryRequest(baseUrl, '/api/auth/verify-forgot-password-otp', {
    email: email.trim().toLowerCase(),
    otp,
  });
export async function resetPassword(
  baseUrl: string,
  email: string,
  password: string,
) {
  const client = createClient<paths>({ baseUrl });
  const { data, error, response } = await client.PATCH(
    '/api/auth/reset-password',
    { body: { email: email.trim().toLowerCase(), password } },
  );
  if (!data) throw apiFailure(response.status, error);
  return data;
}

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
  if (!('organization' in data)) {
    return {
      kind: 'workspace-required',
      user: userFromApi(data.user),
      tokens: data.token,
    };
  }
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
