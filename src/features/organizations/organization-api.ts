import { normalizeApiError } from '@/api/errors';
import { clearOrganizationQueries } from '@/api/query-client';
import { apiClient, sessionManager } from '@/auth/runtime-session';
import {
  useSessionStore,
  type SessionOrganization,
} from '@/auth/session-store';

const fromApi = (value: {
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

export async function switchActiveOrganization(organizationId: string) {
  const current = useSessionStore.getState();
  if (!current.user) throw new Error('An authenticated user is required');
  const { data, error, response } = await apiClient.POST(
    '/api/auth/switch-organization',
    { body: { organizationId } },
  );
  if (!data) {
    const normalized = normalizeApiError(response.status, error);
    const message = normalized.message.toLowerCase();
    if (
      message.includes('not a member') ||
      message.includes('not have access') ||
      message.includes('not active')
    ) {
      await sessionManager.removeUnavailableOrganization(organizationId);
    }
    throw normalized;
  }
  const organization = fromApi(data.organization);
  await clearOrganizationQueries(current.organizationId);
  await sessionManager.establishSession(data.token, {
    user: current.user,
    organization,
    organizationRole:
      organization.role ??
      current.organizations.find((item) => item.id === organization.id)?.role ??
      null,
    organizations: current.organizations.map((item) =>
      item.id === organization.id ? { ...item, ...organization } : item,
    ),
  });
  return organization;
}

async function establishWorkspaceFromResponse(data: {
  user: Record<string, unknown>;
  organization: Parameters<typeof fromApi>[0];
  organizationRole?: string;
  allOrganizations?: Parameters<typeof fromApi>[0][];
  token: { accessToken: string; refreshToken: string };
}) {
  const organization = fromApi(data.organization);
  const currentUser = useSessionStore.getState().user;
  if (!currentUser) throw new Error('An authenticated user is required');
  await sessionManager.establishSession(data.token, {
    user: currentUser,
    organization,
    organizationRole: data.organizationRole ?? organization.role ?? null,
    organizations: (data.allOrganizations ?? [data.organization]).map(fromApi),
  });
  return organization;
}

export async function createWorkspace(name: string) {
  const { data, error, response } = await apiClient.POST('/api/organizations', {
    body: { name: name.trim() },
  });
  if (!data) throw normalizeApiError(response.status, error);
  return establishWorkspaceFromResponse(data);
}

export async function joinWorkspace(inviteCode: string) {
  const { data, error, response } = await apiClient.POST(
    '/api/organizations/join',
    { body: { invite_code: inviteCode.trim() } },
  );
  if (!data) throw normalizeApiError(response.status, error);
  return establishWorkspaceFromResponse(data);
}

export async function deleteWorkspace(
  organizationId: string,
  confirmationName: string,
) {
  const current = useSessionStore.getState();
  if (!current.user) throw new Error('An authenticated user is required');
  const { data, error, response } = await apiClient.DELETE(
    '/api/organizations/{id}',
    {
      params: {
        path: { id: organizationId },
        header: { 'x-organization-id': organizationId },
      },
      body: { confirmationName },
    },
  );
  if (!data) throw normalizeApiError(response.status, error);

  const result = data as {
    token: { accessToken: string; refreshToken: string };
    organization: Parameters<typeof fromApi>[0] | null;
    organizationRole?: string;
    allOrganizations?: Parameters<typeof fromApi>[0][];
  };
  await clearOrganizationQueries(organizationId);
  if (!result.organization) {
    await sessionManager.establishAccountSession(result.token, current.user);
    return null;
  }
  const organization = fromApi(result.organization);
  await sessionManager.establishSession(result.token, {
    user: current.user,
    organization,
    organizationRole: result.organizationRole ?? organization.role ?? null,
    organizations: (result.allOrganizations ?? [result.organization]).map(
      fromApi,
    ),
  });
  return organization;
}
