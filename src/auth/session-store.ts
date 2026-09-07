import { create } from 'zustand';

export type SessionStatus =
  'bootstrapping' | 'authenticated' | 'unauthenticated';

interface SessionState {
  accessToken: string | null;
  organizationId: string | null;
  status: SessionStatus;
  clear: () => void;
  setAuthenticated: (
    accessToken: string,
    organizationId: string | null,
  ) => void;
  setBootstrapping: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  organizationId: null,
  status: 'bootstrapping',
  clear: () =>
    set({
      accessToken: null,
      organizationId: null,
      status: 'unauthenticated',
    }),
  setAuthenticated: (accessToken, organizationId) =>
    set({ accessToken, organizationId, status: 'authenticated' }),
  setBootstrapping: () => set({ status: 'bootstrapping' }),
}));
