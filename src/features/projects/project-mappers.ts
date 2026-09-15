import type {
  PinnedProject,
  ProjectDetail,
  ProjectListItem,
  ProjectStatus,
} from './types';

type ApiProject = Record<string, unknown> & { id: number; title: string };

const projectStatuses = new Set<ProjectStatus>([
  'active',
  'upcoming',
  'in_progress',
  'inactive',
  'completed',
  'cancelled',
  'on_hold',
  'paused',
  'on_review',
  'overdue',
  'draft',
]);

export const normalizeProjectStatus = (value: unknown): ProjectStatus => {
  const status = String(value ?? 'active')
    .toLowerCase()
    .replaceAll(' ', '_');
  return projectStatuses.has(status as ProjectStatus)
    ? (status as ProjectStatus)
    : 'active';
};

export const mapProjectListItem = (project: ApiProject): ProjectListItem => {
  const status = normalizeProjectStatus(project.status);
  const tasks = Array.isArray(project.tasks) ? project.tasks : [];
  const completed = tasks.filter((task) => {
    const row = task as Record<string, unknown>;
    const taskStatus = row.status as Record<string, unknown> | undefined;
    return taskStatus?.isTerminal === true;
  }).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const updatedAt =
    typeof project.updated_at === 'string'
      ? new Date(project.updated_at)
      : null;

  return {
    id: String(project.id),
    tag: typeof project.group === 'string' ? project.group : 'Project',
    updatedLabel:
      updatedAt && !Number.isNaN(updatedAt.getTime())
        ? `Updated ${updatedAt.toLocaleDateString()}`
        : 'Recently updated',
    title: project.title,
    status,
    statusLabel: status.replaceAll('_', ' '),
    progressPercent:
      typeof project.progress === 'number' ? project.progress : progress,
    taskCount:
      typeof project.taskCount === 'number' ? project.taskCount : tasks.length,
  };
};

export const mapPinnedProject = (project: ApiProject): PinnedProject => {
  const item = mapProjectListItem(project);
  return {
    id: item.id,
    tag: item.tag,
    status: item.status,
    title: item.title,
    description:
      typeof project.description === 'string' ? project.description : '',
    progressPercent: item.progressPercent,
    progressLabel: `${item.taskCount} tasks`,
    taskCount: item.taskCount,
    dueLabel:
      typeof project.due_date === 'string'
        ? new Date(project.due_date).toLocaleDateString()
        : 'No due date',
    avatars: [],
  };
};

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};

export const mapProjectDetail = (
  projectId: number,
  value: unknown,
): ProjectDetail => {
  const overview = record(value);
  const project = record(overview.project);
  const tasks = Array.isArray(overview.tasks) ? overview.tasks : [];
  const peers = Array.isArray(overview.projectPeers)
    ? overview.projectPeers
    : [];
  const totalTasks = Number(overview.totalTasks ?? tasks.length);
  const completed = tasks.filter((value) => {
    const status = record(record(value).status);
    return Boolean(status.isTerminal ?? status.is_terminal);
  }).length;

  return {
    id: String(project.id ?? projectId),
    tag: 'Project',
    title: String(project.title ?? 'Project'),
    description: String(project.description ?? 'No description added.'),
    status: normalizeProjectStatus(project.status),
    progressPercent: totalTasks
      ? Math.round((completed / totalTasks) * 100)
      : 0,
    dueLabel:
      typeof project.due_date === 'string'
        ? new Date(project.due_date).toLocaleDateString()
        : 'No due date',
    completedTaskCount: completed,
    members: peers.map((value) => {
      const peer = record(value);
      const name =
        `${String(peer.first_name ?? '')} ${String(peer.last_name ?? '')}`.trim() ||
        String(peer.email ?? 'Member');
      return {
        id: String(peer.id),
        name,
        role: String(peer.role ?? 'Member'),
        initials: name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        color: '#667085',
      };
    }),
    milestones: [],
    tasks: tasks.map((value) => {
      const task = record(value);
      const status = record(task.status);
      const assignees = Array.isArray(task.assignees) ? task.assignees : [];
      const assignee = record(assignees[0]);
      const assigneeName =
        `${String(assignee.first_name ?? '')} ${String(assignee.last_name ?? '')}`.trim() ||
        String(assignee.email ?? 'Unassigned');
      const priority = Number(task.priority ?? 0);
      const resources = Array.isArray(task.resources) ? task.resources : [];
      return {
        id: String(task.id),
        title: String(task.title ?? 'Untitled task'),
        status: String(
          status.title ?? 'Backlog',
        ) as ProjectDetail['tasks'][number]['status'],
        isTerminal: Boolean(status.isTerminal ?? status.is_terminal),
        priority: priority >= 2 ? 'high' : priority === 1 ? 'medium' : 'low',
        attachmentCount: resources.length,
        dueLabel:
          typeof task.due_date === 'string'
            ? new Date(task.due_date).toLocaleDateString()
            : 'No due date',
        assignee: {
          id: String(assignee.id ?? 'unassigned'),
          name: assigneeName,
          role: '',
          initials: assigneeName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          color: '#667085',
        },
      };
    }),
    activity: [],
  };
};
