import { normalizeApiError } from '@/api/errors';
import { apiClient, sessionManager } from '@/auth/runtime-session';
import { useSessionStore } from '@/auth/session-store';
import { environment } from '@/config/env';
import { File, UploadType } from 'expo-file-system';
import type { ChatAttachment } from './types';

const header = () => {
  const organizationId = useSessionStore.getState().organizationId;
  if (!organizationId) throw new Error('Select a workspace first.');
  return { 'x-organization-id': organizationId };
};

const request = async <T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
) => {
  const result = await promise;
  if (!result.response.ok || result.error)
    throw normalizeApiError(result.response.status, result.error);
  return result.data as unknown;
};

const data = (value: unknown) => {
  if (typeof value === 'object' && value !== null && 'data' in value)
    return (value as { data: unknown }).data;
  return value;
};

export const fetchConversations = async () =>
  data(
    await request(
      apiClient.GET('/api/messages/conversations', {
        params: { header: header() },
      }),
    ),
  );

export const fetchPeers = async () =>
  data(
    await request(
      apiClient.GET('/api/messages/get-peers', {
        params: { header: header() },
      }),
    ),
  );

export const startConversation = async (peerId: number) =>
  data(
    await request(
      apiClient.POST('/api/messages/conversations', {
        params: { header: header() },
        body: { peer_id: peerId },
      } as never),
    ),
  );

export const fetchMessages = async (
  conversationId: string,
  cursor?: { id: string; createdAt: string } | null,
) =>
  request(
    apiClient.GET('/api/messages/conversation/{id}', {
      params: {
        header: header(),
        path: { id: conversationId },
        query: {
          beforeId: cursor?.id ?? '',
          beforeCreatedAt: cursor?.createdAt ?? '',
          limit: '30',
        },
      },
    }),
  );

export const sendMessage = async (
  conversationId: string,
  content: string,
  clientMessageId: string,
  attachments: ChatAttachment[] = [],
) =>
  data(
    await request(
      apiClient.POST('/api/messages/send', {
        params: { header: header() },
        body: {
          conversationId,
          content,
          clientMessageId,
          attachments: attachments.map(({ fileUrl, fileType, fileName }) => ({
            fileUrl,
            fileType: fileType ?? undefined,
            fileName,
          })),
        },
      } as never),
    ),
  );

export const uploadAttachment = async (file: {
  uri: string;
  name: string;
  mimeType?: string | null;
}): Promise<ChatAttachment> => {
  const initialState = useSessionStore.getState();
  if (!initialState.accessToken || !initialState.organizationId)
    throw new Error('Select a workspace first.');
  const uploadFile = new File(file.uri);
  const performUpload = (accessToken: string) =>
    uploadFile.upload(`${environment.apiUrl}/api/messages/upload`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: file.mimeType ?? 'application/octet-stream',
      parameters: { fileName: file.name },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-organization-id': initialState.organizationId!,
      },
    });
  let response = await performUpload(initialState.accessToken);
  if (response.status === 401) {
    const refreshedToken = await sessionManager.refreshAccessToken();
    if (refreshedToken) response = await performUpload(refreshedToken);
  }
  const responseText = response.body;
  let result: unknown = null;
  try {
    result = responseText ? JSON.parse(responseText) : null;
  } catch {
    result = { message: responseText || `Upload failed (${response.status})` };
  }
  if (response.status < 200 || response.status >= 300)
    throw normalizeApiError(response.status, result);
  const attachment = data(result) as ChatAttachment;
  return {
    ...attachment,
    localUri: file.uri,
  };
};

export const markConversationRead = async (
  conversationId: string,
  lastReadMessageId: string,
) =>
  request(
    apiClient.POST('/api/messages/conversation/{id}/read', {
      params: { header: header(), path: { id: conversationId } },
      body: { lastReadMessageId },
    } as never),
  );

export const addReaction = async (messageId: string, emoji: string) =>
  data(
    await request(
      apiClient.POST('/api/messages/{id}/reactions', {
        params: { header: header(), path: { id: messageId } },
        body: { emoji },
      } as never),
    ),
  );
