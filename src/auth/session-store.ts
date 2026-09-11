import { create } from 'zustand';

export type SessionStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated'
  | 'workspace-required'
  | 'selecting-organization';
export interface SessionUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}
export interface SessionOrganization {
  id: string;
  name: string;
  slug: string;
  role?: string | null;
  onboardingComplete?: boolean;
}
export interface SessionContext {
  user: SessionUser;
  organization: SessionOrganization;
  organizationRole: string | null;
  organizations: SessionOrganization[];
}
interface PendingLogin {
  email: string;
  password: string;
}
interface SessionState extends Partial<SessionContext> {
  accessToken: string | null;
  organizationId: string | null;
  organizationRole: string | null;
  organizations: SessionOrganization[];
  pendingLogin: PendingLogin | null;
  status: SessionStatus;
  clear: () => void;
  beginOrganizationSelection: (
    credentials: PendingLogin,
    organizations: SessionOrganization[],
  ) => void;
  setWorkspaceRequired: (accessToken: string, user: SessionUser) => void;
  setAuthenticated: (accessToken: string, context: SessionContext) => void;
  setBootstrapping: () => void;
}
const cleared = {
  accessToken: null,
  organizationId: null,
  organizationRole: null,
  organization: undefined,
  organizations: [],
  pendingLogin: null,
  user: undefined,
};
export const useSessionStore = create<SessionState>((set) => ({
  ...cleared,
  status: 'bootstrapping',
  clear: () => set({ ...cleared, status: 'unauthenticated' }),
  beginOrganizationSelection: (pendingLogin, organizations) =>
    set({
      ...cleared,
      pendingLogin,
      organizations,
      status: 'selecting-organization',
    }),
  setWorkspaceRequired: (accessToken, user) =>
    set({
      ...cleared,
      accessToken,
      status: 'workspace-required',
      user,
    }),
  setAuthenticated: (accessToken, context) =>
    set({
      accessToken,
      organizationId: context.organization.id,
      organizationRole: context.organizationRole,
      organization: context.organization,
      organizations: context.organizations,
      pendingLogin: null,
      status: 'authenticated',
      user: context.user,
    }),
  setBootstrapping: () => set({ status: 'bootstrapping' }),
}));
