import type { AttentionItem, ProjectItem, TaskBucket, TaskItem } from './types';

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'att-1',
    kind: 'critical',
    badgeLabel: 'Critical',
    meta: 'Due yesterday',
    title: '2 Overdue Tasks',
    subtitle: 'Mobile Auth API & CI Webhook',
    actionLabel: 'Resolve now',
  },
  {
    id: 'att-2',
    kind: 'blocked',
    badgeLabel: 'Blocked',
    meta: 'QA wait',
    title: '1 Blocked Item',
    subtitle: 'Blocked by Design QA signoff',
    actionLabel: 'Ping reviewer',
  },
  {
    id: 'att-3',
    kind: 'approval',
    badgeLabel: 'Approval',
    meta: 'Sprint 24',
    title: '1 Pending Approval',
    subtitle: 'Sprint 24 scope adjustment',
    actionLabel: 'Decide',
  },
];

export const TASK_ITEMS: TaskItem[] = [
  {
    id: 'task-1',
    bucket: 'today',
    category: 'Core Platform',
    title: 'Review FIDO2 WebAuthn payload format',
    priority: 'high',
    dueLabel: 'Today, 2:00 PM',
    blockedBy: '#304',
  },
  {
    id: 'task-2',
    bucket: 'today',
    category: 'Mobile Companion',
    title: 'Finalize mobile onboarding copy',
    priority: 'medium',
    dueLabel: 'Today, 5:30 PM',
    checklist: { done: 2, total: 2 },
  },
  {
    id: 'task-3',
    bucket: 'today',
    category: 'Core Platform',
    title: 'Merge organization switcher cache isolation patch',
    priority: 'high',
    dueLabel: 'Yesterday',
    overdue: true,
  },
  {
    id: 'task-4',
    bucket: 'upcoming',
    category: 'Mobile Companion',
    title: 'Wire push-notification permission prompt',
    priority: 'medium',
    dueLabel: 'Tomorrow, 10:00 AM',
  },
  {
    id: 'task-5',
    bucket: 'later',
    category: 'Core Platform',
    title: 'Draft audit-trail schema proposal',
    priority: 'low',
    dueLabel: 'Next week',
  },
];

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'Mobile Companion',
    subtitle: 'Q3 core initiative',
    status: 'on-track',
    progressLabel: 'Progress (12/18 tasks done)',
    progressPercent: 68,
    avatars: [
      { initials: 'JD', color: '#93F2F2' },
      { initials: 'AL', color: '#CDE5FF' },
      { initials: 'RK', color: '#B6F62E' },
    ],
    extraCount: 1,
    updatedLabel: 'Updated 12m ago',
  },
  {
    id: 'proj-2',
    name: 'Core Platform v2',
    subtitle: 'Enterprise architecture migration',
    status: 'attention',
    progressLabel: 'Progress (27/32 tasks done)',
    progressPercent: 84,
    avatars: [
      { initials: 'MC', color: '#76D6D5' },
      { initials: 'SK', color: '#95CCFF' },
      { initials: 'PL', color: '#9CD900' },
    ],
    extraCount: 3,
    updatedLabel: 'Updated 1h ago',
  },
];

export const TASK_TABS: { key: TaskBucket; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'later', label: 'Later' },
];
