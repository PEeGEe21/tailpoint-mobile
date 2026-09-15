import { apiClient } from '@/auth/runtime-session';
import { useSessionStore } from '@/auth/session-store';
import { normalizeApiError } from '@/api/errors';

const unwrap = <T>(value: {
  data?: T;
  error?: unknown;
  response: Response;
}): T => {
  if (!value.response.ok || value.error)
    throw normalizeApiError(value.response.status, value.error);
  if (value.data === undefined) throw new Error('The server returned no data.');
  return value.data;
};

const organizationHeader = () => {
  const organizationId = useSessionStore.getState().organizationId;
  if (!organizationId) throw new Error('Select a workspace first.');
  return { 'x-organization-id': organizationId };
};

export const listApprovals = async () =>
  unwrap(
    await apiClient.GET('/api/approvals/inbox', {
      params: { header: organizationHeader() },
    }),
  ).data;

export const respondToApproval = async (
  projectId: number,
  id: string,
  decision: 'approved' | 'rejected',
  comment?: string,
) =>
  unwrap(
    await apiClient.POST('/api/approvals/projects/{projectId}/{id}/respond', {
      params: { header: organizationHeader(), path: { projectId, id } },
      body: { decision, comment },
    }),
  ).data;

export const listNotifications = async () =>
  unwrap(
    await apiClient.GET('/api/notifications', {
      params: {
        header: organizationHeader(),
        query: { page: 1, limit: 100, search: '', type: '', status: '' },
      },
    }),
  ).data;

export const markNotificationRead = async (id: number) =>
  unwrap(
    await apiClient.PATCH('/api/notifications/{id}/read', {
      params: { header: organizationHeader(), path: { id } } as never,
    }),
  ).data;
