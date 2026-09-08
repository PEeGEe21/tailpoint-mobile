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
  if (!data) throw normalizeApiError(response.status, error);
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
