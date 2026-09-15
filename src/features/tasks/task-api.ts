import { apiClient, sessionManager } from '@/auth/runtime-session';
import { useSessionStore } from '@/auth/session-store';
import { normalizeApiError } from '@/api/errors';
import type { components } from '@/api/generated/schema';
import { File, UploadType } from 'expo-file-system';
import { environment } from '@/config/env';

type CreateTaskBody = components['schemas']['CreateTaskDto'];
type UpdateTaskBody = components['schemas']['UpdateTaskDto'];

const result = async <T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
) => {
  const response = await request;
  if (!response.response.ok || response.error)
    throw normalizeApiError(response.response.status, response.error);
  if (response.data === undefined)
    throw new Error('The server returned no data.');
  return response.data;
};

const organizationHeader = () => {
  const organizationId = useSessionStore.getState().organizationId;
  if (!organizationId) throw new Error('Select a workspace first.');
  return { 'x-organization-id': organizationId };
};

const dataOrPayload = <T>(payload: T): unknown => {
  if (typeof payload === 'object' && payload !== null && 'data' in payload)
    return (payload as { data: unknown }).data;
  return payload;
};

const extractTaskList = (payload: unknown): unknown[] => {
  console.log(payload, 'jdw');
  if (Array.isArray(payload)) return payload;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null && 'data' in data) {
      const nested = (data as { data: unknown }).data;
      if (Array.isArray(nested)) return nested;
    }
  }
  throw new Error('Tasks returned an invalid list response.');
};

export const listTasks = async () =>
  extractTaskList(
    await result(
      apiClient.GET('/api/tasks', { params: { header: organizationHeader() } }),
    ),
  );

export const getTask = async (id: number) =>
  dataOrPayload(
    await result(
      apiClient.GET('/api/tasks/{id}', {
        params: { header: organizationHeader(), path: { id } },
      }),
    ),
  );

export const createTask = async (projectId: number, body: CreateTaskBody) =>
  dataOrPayload(
    await result(
      apiClient.POST('/api/tasks/{projectId}', {
        params: { header: organizationHeader(), path: { projectId } },
        body,
      }),
    ),
  );

export const updateTask = async (id: number, body: UpdateTaskBody) =>
  (
    await result(
      apiClient.PUT('/api/tasks/{id}', {
        params: { header: organizationHeader(), path: { id } },
        body,
      }),
    )
  ).data;

export const updateTaskWithAttachment = async (
  id: number,
  body: UpdateTaskBody,
  attachment: { uri: string; name: string; mimeType?: string | null },
) => {
  const state = useSessionStore.getState();
  if (!state.accessToken || !state.organizationId)
    throw new Error('Select a workspace first.');
  const parameters = Object.fromEntries(
    Object.entries(body)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]),
  );
  const file = new File(attachment.uri);
  const upload = (token: string) =>
    file.upload(`${environment.apiUrl}/api/tasks/${id}/with-attachments`, {
      httpMethod: 'PUT',
      uploadType: UploadType.MULTIPART,
      fieldName: 'attachments',
      mimeType: attachment.mimeType ?? 'application/octet-stream',
      parameters,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-organization-id': state.organizationId!,
      },
    });
  let response = await upload(state.accessToken);
  if (response.status === 401) {
    const token = await sessionManager.refreshAccessToken();
    if (token) response = await upload(token);
  }
  let payload: unknown = null;
  try {
    payload = JSON.parse(response.body);
  } catch {
    payload = { message: response.body };
  }
  if (response.status < 200 || response.status >= 300)
    throw normalizeApiError(response.status, payload);
  return dataOrPayload(payload);
};

export const uploadTaskAttachment = async (
  taskId: number,
  projectId: number,
  attachment: { uri: string; name: string; mimeType?: string | null },
) => {
  const state = useSessionStore.getState();
  if (!state.accessToken || !state.organizationId)
    throw new Error('Select a workspace first.');
  const file = new File(attachment.uri);
  const upload = (token: string) =>
    file.upload(`${environment.apiUrl}/api/resources/upload`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: attachment.mimeType ?? 'application/octet-stream',
      parameters: {
        title: attachment.name,
        mime_type: attachment.mimeType ?? 'application/octet-stream',
        type: 'file',
        projectId: String(projectId),
        taskId: String(taskId),
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'x-organization-id': state.organizationId!,
      },
    });
  let response = await upload(state.accessToken);
  if (response.status === 401) {
    const token = await sessionManager.refreshAccessToken();
    if (token) response = await upload(token);
  }
  let payload: unknown;
  try {
    payload = JSON.parse(response.body);
  } catch {
    payload = { message: response.body };
  }
  if (response.status < 200 || response.status >= 300)
    throw normalizeApiError(response.status, payload);
  return dataOrPayload(payload);
};

export const deleteTask = async (id: number) =>
  result(
    apiClient.DELETE('/api/tasks/{id}', {
      params: { header: organizationHeader(), path: { id } },
    }),
  );

export const updateTaskStatus = async (id: number, statusId: number) =>
  (
    await result(
      apiClient.PATCH('/api/tasks/{id}/status', {
        params: { header: organizationHeader(), path: { id } },
        body: { statusId },
      }),
    )
  ).data;

export const toggleTaskPriority = async (id: number, current: boolean) =>
  dataOrPayload(
    await result(
      apiClient.PATCH('/api/tasks/{id}/update-priority', {
        params: { header: organizationHeader(), path: { id } },
        body: { priority: current },
      }),
    ),
  );
