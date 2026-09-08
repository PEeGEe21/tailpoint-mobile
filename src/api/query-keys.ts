export const queryKeys = {
  organizations: { all: ['organizations'] as const },
  projects: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'projects'] as const,
    detail: (organizationId: string, projectId: number) =>
      ['organizations', organizationId, 'projects', projectId] as const,
  },
  tasks: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'tasks'] as const,
  },
  approvals: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'approvals'] as const,
  },
  notifications: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'notifications'] as const,
  },
};
