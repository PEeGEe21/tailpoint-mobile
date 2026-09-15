export const queryKeys = {
  organizations: { all: ['organizations'] as const },
  projects: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'projects'] as const,
    detail: (organizationId: string, projectId: number) =>
      ['organizations', organizationId, 'projects', projectId] as const,
    members: (organizationId: string, projectId: number) =>
      [
        'organizations',
        organizationId,
        'projects',
        projectId,
        'members',
      ] as const,
    inviteCandidates: (
      organizationId: string,
      projectId: number,
      search: string,
    ) =>
      [
        'organizations',
        organizationId,
        'projects',
        projectId,
        'invite-candidates',
        search,
      ] as const,
    pinned: (organizationId: string) =>
      ['organizations', organizationId, 'projects', 'pinned'] as const,
    activity: (organizationId: string, projectId: number) =>
      [
        'organizations',
        organizationId,
        'projects',
        projectId,
        'activity',
      ] as const,
  },
  tasks: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'tasks'] as const,
    detail: (organizationId: string, taskId: number) =>
      ['organizations', organizationId, 'tasks', taskId] as const,
  },
  approvals: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'approvals'] as const,
  },
  notifications: {
    all: (organizationId: string) =>
      ['organizations', organizationId, 'notifications'] as const,
  },
  chat: {
    conversations: (organizationId: string) =>
      ['organizations', organizationId, 'chat', 'conversations'] as const,
    messages: (organizationId: string, conversationId: string) =>
      [
        'organizations',
        organizationId,
        'chat',
        'conversations',
        conversationId,
        'messages',
      ] as const,
    peers: (organizationId: string) =>
      ['organizations', organizationId, 'chat', 'peers'] as const,
  },
};
