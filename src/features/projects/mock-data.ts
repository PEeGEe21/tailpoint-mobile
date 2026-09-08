import type {
  PinnedProject,
  ProjectDetail,
  ProjectListItem,
  ProjectMember,
} from './types';

const MEMBERS: ProjectMember[] = [
  {
    id: 'member-1',
    name: 'Jordan Davis',
    role: 'Product lead',
    initials: 'JD',
    color: '#006565',
  },
  {
    id: 'member-2',
    name: 'Amina Lawal',
    role: 'Mobile engineer',
    initials: 'AL',
    color: '#006399',
  },
  {
    id: 'member-3',
    name: 'Ravi Kumar',
    role: 'Product designer',
    initials: 'RK',
    color: '#456300',
  },
];

export const PINNED_PROJECTS: PinnedProject[] = [
  {
    id: 'proj-1',
    tag: 'Q3 Core Initiative',
    status: 'in_progress',
    health: 'healthy',
    title: 'Mobile Companion',
    description:
      'Native companion app for quick approvals, daily tasks, and attention queue.',
    progressPercent: 68,
    progressLabel: '12 of 18 tasks',
    taskCount: 18,
    milestoneCount: 2,
    dueLabel: 'Oct 15',
    avatars: MEMBERS.map(({ initials, color }) => ({ initials, color })),
    extraCount: 3,
  },
  {
    id: 'proj-2',
    tag: 'Architecture Migration',
    status: 'active',
    health: 'at_risk',
    title: 'Core Platform v2',
    description:
      'Upgrading foundational API gateway, multi-tenant caching layer, and edge routing.',
    progressPercent: 84,
    progressLabel: '27 of 32 tasks',
    blockerLabel: '1 Blocker',
    taskCount: 32,
    dueLabel: 'Sep 30',
    blocked: true,
    avatars: [
      { initials: 'MC', color: '#42B0FF' },
      { initials: 'SK', color: '#006565' },
      { initials: 'PL', color: '#76D6D5' },
    ],
    extraCount: 3,
  },
];

export const LIST_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj-3',
    tag: 'Security',
    updatedLabel: 'Updated 3h ago',
    title: 'Enterprise SSO & Passkey Support',
    status: 'active',
    statusLabel: 'Active',
    progressPercent: 45,
    taskCount: 9,
  },
  {
    id: 'proj-4',
    tag: 'Design Ops',
    updatedLabel: 'Updated yesterday',
    title: 'Design System & Token Sync',
    status: 'on_review',
    statusLabel: 'In Review',
    progressPercent: 92,
    taskCount: 14,
  },
  {
    id: 'proj-5',
    tag: 'Web-first Core',
    updatedLabel: 'Updated 4d ago',
    title: 'Billing & Entitlement Tiering',
    status: 'paused',
    statusLabel: 'Paused',
    progressPercent: 15,
    taskCount: 6,
  },
];

const BASE_DETAIL: ProjectDetail = {
  id: 'proj-1',
  tag: 'Q3 Core Initiative',
  title: 'Mobile Companion',
  description:
    'A focused mobile workspace for quick approvals, daily tasks, and everything that needs your attention while you are away from your desk.',
  status: 'in_progress',
  health: 'healthy',
  progressPercent: 68,
  dueLabel: 'October 15',
  completedTaskCount: 12,
  members: MEMBERS,
  milestones: [
    {
      id: 'milestone-1',
      title: 'Authentication and onboarding',
      dateLabel: 'Sep 12',
      completed: true,
    },
    {
      id: 'milestone-2',
      title: 'Core workspace screens',
      dateLabel: 'Sep 28',
      completed: false,
    },
    {
      id: 'milestone-3',
      title: 'Beta release',
      dateLabel: 'Oct 15',
      completed: false,
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review FIDO2 WebAuthn payload format',
      status: 'Building',
      priority: 'high',
      dueLabel: 'Today',
      assignee: MEMBERS[0],
    },
    {
      id: 'task-2',
      title: 'Finalize mobile onboarding copy',
      status: 'Backlog',
      priority: 'medium',
      dueLabel: 'Tomorrow',
      assignee: MEMBERS[1],
    },
    {
      id: 'task-3',
      title: 'Merge organization switcher cache isolation patch',
      status: 'Shipped',
      priority: 'low',
      dueLabel: 'Sep 6',
      assignee: MEMBERS[2],
    },
  ],
  activity: [
    {
      id: 'activity-1',
      actor: 'Amina',
      description: 'completed the authentication flow',
      timeLabel: '2h ago',
    },
    {
      id: 'activity-2',
      actor: 'Jordan',
      description: 'updated the beta release milestone',
      timeLabel: 'Yesterday',
    },
    {
      id: 'activity-3',
      actor: 'Ravi',
      description: 'shared 3 new design files',
      timeLabel: '2d ago',
    },
  ],
};

const DETAIL_OVERRIDES: Record<string, Partial<ProjectDetail>> = {
  'proj-2': {
    tag: 'Architecture Migration',
    title: 'Core Platform v2',
    status: 'active',
    health: 'at_risk',
    progressPercent: 84,
    dueLabel: 'September 30',
    completedTaskCount: 27,
  },
  'proj-3': {
    tag: 'Security',
    title: 'Enterprise SSO & Passkey Support',
    progressPercent: 45,
    completedTaskCount: 4,
  },
  'proj-4': {
    tag: 'Design Ops',
    title: 'Design System & Token Sync',
    progressPercent: 92,
    completedTaskCount: 13,
  },
  'proj-5': {
    tag: 'Web-first Core',
    title: 'Billing & Entitlement Tiering',
    status: 'paused',
    progressPercent: 15,
    completedTaskCount: 1,
  },
};

export function getMockProjectDetail(id: string): ProjectDetail {
  return { ...BASE_DETAIL, ...DETAIL_OVERRIDES[id], id };
}
