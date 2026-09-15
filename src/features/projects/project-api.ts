import { apiClient } from '@/auth/runtime-session';
import { useSessionStore } from '@/auth/session-store';
import { normalizeApiError } from '@/api/errors';
import type { components } from '@/api/generated/schema';

type ProjectApiItem = components['schemas']['ProjectContractDto'] &
  Record<string, unknown>;

const unwrap = <T>(response: {
  data?: T;
  error?: unknown;
  response: Response;
}): T => {
  if (!response.response.ok || response.error) {
    throw normalizeApiError(response.response.status, response.error);
  }
  if (response.data === undefined)
    throw new Error('The server returned no data.');
  return response.data;
};

const organizationHeader = () => {
  const organizationId = useSessionStore.getState().organizationId;
  if (!organizationId) throw new Error('Select a workspace first.');
  return { 'x-organization-id': organizationId };
};

const extractList = (payload: unknown, label: string): ProjectApiItem[] => {
  if (Array.isArray(payload)) return payload as ProjectApiItem[];
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data as ProjectApiItem[];
    if (typeof data === 'object' && data !== null && 'data' in data) {
      const nested = (data as { data: unknown }).data;
      if (Array.isArray(nested)) return nested as ProjectApiItem[];
    }
  }
  throw new Error(`${label} returned an invalid list response.`);
};

export async function listProjects(search = '', status = '') {
  const payload = unwrap(
    await apiClient.GET('/api/projects/my-projects', {
      params: {
        header: organizationHeader(),
        query: { page: 1, limit: 100, search, status, due_date: '', group: '' },
      },
    }),
  );
  return extractList(payload, 'Projects');
}

export async function getProject(projectId: number) {
  const payload = unwrap(
    await apiClient.GET('/api/projects/{id}/overview', {
      params: { header: organizationHeader(), path: { id: projectId } },
    }),
  ) as Record<string, unknown> & { data?: unknown };
  // This legacy endpoint currently returns its payload directly despite the
  // generated contract declaring the standard response envelope.
  return payload.data ?? payload;
}

export async function getProjectTasks(projectId: number) {
  return unwrap(
    await apiClient.GET('/api/projects/{projectId}/tasks', {
      params: { header: organizationHeader(), path: { projectId } },
    }),
  ).data;
}

export async function getProjectMembers(projectId: number) {
  const payload = unwrap(
    await apiClient.GET('/api/projects/{projectId}/members', {
      params: { header: organizationHeader(), path: { projectId } },
    }),
  ) as { data?: unknown };
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function inviteProjectMembers(
  projectId: number,
  emails: string[],
  role: 'viewer' | 'contributor' | 'editor',
) {
  return unwrap(
    await apiClient.POST('/api/projects/invite/{projectId}', {
      params: { header: organizationHeader(), path: { projectId } },
      body: { emails, role },
    }),
  );
}

export async function listProjectInviteCandidates(
  projectId: number,
  search = '',
) {
  const payload = unwrap(
    await apiClient.GET('/api/projects/{projectId}/invite-candidates', {
      params: {
        header: organizationHeader(),
        path: { projectId },
        query: { search, page: 1, limit: 50 },
      },
    }),
  ) as { data?: unknown };
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function listProjectActivity(projectId: number) {
  const payload = unwrap(
    await apiClient.GET('/api/projects/activity', {
      params: {
        header: organizationHeader(),
        query: {
          search: '',
          type: '',
          page: 1,
          limit: 30,
          projectId,
        } as never,
      },
    }),
  ) as { data?: unknown };
  const nested = payload.data as { data?: unknown } | undefined;
  return Array.isArray(nested?.data)
    ? nested.data
    : Array.isArray(payload.data)
      ? payload.data
      : [];
}

export async function listPinnedProjectIds(): Promise<number[]> {
  const response = await apiClient.GET('/api/users/me/sidebar-projects', {
    params: { header: organizationHeader() },
  });
  if (!response.response.ok || response.error)
    throw normalizeApiError(response.response.status, response.error);
  const payload = response.data as unknown as {
    data?: { projectId?: number; project_id?: number }[];
  };
  return (payload?.data ?? [])
    .map((pin) => Number(pin.projectId ?? pin.project_id))
    .filter(Number.isFinite);
}

export interface ProjectMutationInput {
  title: string;
  description: string;
  status?:
    | 'active'
    | 'upcoming'
    | 'in_progress'
    | 'inactive'
    | 'completed'
    | 'cancelled'
    | 'on_hold'
    | 'paused'
    | 'on_review'
    | 'overdue'
    | 'draft';
}

export async function createProject(input: ProjectMutationInput) {
  return unwrap(
    await apiClient.POST('/api/projects/new-project', {
      params: { header: organizationHeader() },
      body: { title: input.title, description: input.description },
    }),
  ).data;
}

export async function updateProject(
  projectId: number,
  input: ProjectMutationInput,
) {
  return unwrap(
    await apiClient.PUT('/api/projects/{id}', {
      params: { header: organizationHeader(), path: { id: projectId } },
      body: input,
    }),
  ).data;
}

export async function deleteProject(projectId: number) {
  return unwrap(
    await apiClient.POST('/api/projects/delete/{id}', {
      params: { header: organizationHeader(), path: { id: projectId } },
    }),
  );
}

export async function setProjectPinned(projectId: number, pinned: boolean) {
  const params = {
    header: organizationHeader(),
    path: { projectId },
  };
  const response = pinned
    ? await apiClient.PUT('/api/users/me/sidebar-projects/{projectId}', {
        params,
      })
    : await apiClient.DELETE('/api/users/me/sidebar-projects/{projectId}', {
        params,
      });
  if (!response.response.ok || response.error)
    throw normalizeApiError(response.response.status, response.error);
}
