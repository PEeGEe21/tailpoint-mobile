import type { ProjectMember, Task, WorkflowStatus } from './types';

export const ORGANIZATION_ID = '0f5d89f0-3691-4db5-b3a0-71f6095f6710';
export const TASK_PROJECTS = [
  { id: 101, title: 'Mobile Companion' },
  { id: 102, title: 'Core Platform v2' },
] as const;
export const PROJECT_MEMBERS: ProjectMember[] = [
  {
    id: 11,
    name: 'Jordan Davis',
    email: 'jordan@acmestudio.com',
    initials: 'JD',
    role: 'owner',
    avatarColor: '#76D6D5',
  },
  {
    id: 12,
    name: 'Amina Lawal',
    email: 'amina@acmestudio.com',
    initials: 'AL',
    role: 'editor',
    avatarColor: '#95CCFF',
  },
  {
    id: 13,
    name: 'Ravi Kumar',
    email: 'ravi@acmestudio.com',
    initials: 'RK',
    role: 'contributor',
    avatarColor: '#B6F62E',
  },
];
export const PROJECT_WORKFLOW_STATUSES: Record<number, WorkflowStatus[]> = {
  101: [
    {
      id: 1001,
      title: 'Backlog',
      color: '#94A3B8',
      tabId: 0,
      isTerminal: false,
    },
    {
      id: 1002,
      title: 'Building',
      color: '#3B82F6',
      tabId: 1,
      isTerminal: false,
    },
    {
      id: 1003,
      title: 'Ready for QA',
      color: '#8B5CF6',
      tabId: 2,
      isTerminal: false,
    },
    {
      id: 1004,
      title: 'Shipped',
      color: '#10B981',
      tabId: 3,
      isTerminal: true,
    },
  ],
  102: [
    {
      id: 2001,
      title: 'Queued',
      color: '#94A3B8',
      tabId: 0,
      isTerminal: false,
    },
    {
      id: 2002,
      title: 'Implementing',
      color: '#3B82F6',
      tabId: 1,
      isTerminal: false,
    },
    {
      id: 2003,
      title: 'Architecture review',
      color: '#8B5CF6',
      tabId: 2,
      isTerminal: false,
    },
    {
      id: 2004,
      title: 'Released',
      color: '#10B981',
      tabId: 3,
      isTerminal: true,
    },
  ],
};
const member = (id: number) => PROJECT_MEMBERS.filter((item) => item.id === id);
const status = (projectId: number, statusId: number) =>
  PROJECT_WORKFLOW_STATUSES[projectId].find((item) => item.id === statusId)!;
export const MOCK_TASKS: Task[] = [
  {
    id: 301,
    title: 'Review FIDO2 WebAuthn payload format',
    description:
      'Review the updated authentication payload and leave implementation notes for the platform team.',
    project: TASK_PROJECTS[1],
    priority: 1,
    severity: 'high',
    status: status(102, 2002),
    due_date: '2026-09-08T14:00:00.000Z',
    assignees: member(11),
    organization_id: ORGANIZATION_ID,
  },
  {
    id: 302,
    title: 'Finalize mobile onboarding copy',
    description:
      'Complete the final copy review for authentication and workspace onboarding.',
    project: TASK_PROJECTS[0],
    priority: 2,
    severity: 'medium',
    status: status(101, 1001),
    due_date: '2026-09-08T17:30:00.000Z',
    assignees: member(12),
    organization_id: ORGANIZATION_ID,
  },
  {
    id: 303,
    title: 'Verify organization switcher cache isolation',
    description: 'Verify tenant cache keys before the platform release.',
    project: TASK_PROJECTS[1],
    priority: 1,
    severity: 'high',
    status: status(102, 2003),
    due_date: '2026-09-07T16:00:00.000Z',
    assignees: member(11),
    organization_id: ORGANIZATION_ID,
  },
  {
    id: 304,
    title: 'Wire push-notification permission prompt',
    description:
      'Add the native permission prompt after onboarding is complete.',
    project: TASK_PROJECTS[0],
    priority: 3,
    severity: 'medium',
    status: status(101, 1002),
    due_date: '2026-09-09T10:00:00.000Z',
    assignees: member(12),
    organization_id: ORGANIZATION_ID,
  },
  {
    id: 305,
    title: 'Draft audit-trail schema proposal',
    description:
      'Document events, retention requirements, and organization boundaries.',
    project: TASK_PROJECTS[1],
    priority: 4,
    severity: 'low',
    status: status(102, 2001),
    due_date: '2026-09-14T09:00:00.000Z',
    assignees: member(13),
    organization_id: ORGANIZATION_ID,
  },
];
