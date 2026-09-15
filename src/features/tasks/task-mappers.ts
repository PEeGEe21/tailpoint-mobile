import type { Task, TaskSeverity, WorkflowStatus } from './types';

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord =>
  typeof value === 'object' && value !== null ? (value as ApiRecord) : {};

export const mapTask = (value: unknown): Task => {
  const task = asRecord(value);
  const project = asRecord(task.project);
  const status = asRecord(task.status);
  const assignees = Array.isArray(task.assignees) ? task.assignees : [];
  const resources = Array.isArray(task.resources) ? task.resources : [];

  return {
    id: Number(task.id),
    title: String(task.title ?? 'Untitled task'),
    description: typeof task.description === 'string' ? task.description : null,
    priority: Number(task.priority ?? 0),
    severity: ['low', 'medium', 'high', 'critical'].includes(
      String(task.severity),
    )
      ? (task.severity as TaskSeverity)
      : null,
    due_date: typeof task.due_date === 'string' ? task.due_date : null,
    organization_id: String(task.organization_id ?? ''),
    project: {
      id: Number(project.id ?? task.project_id ?? 0),
      title: String(project.title ?? 'Project'),
    },
    status: {
      id: Number(status.id ?? 0),
      title: String(status.title ?? 'Backlog'),
      color: String(status.color ?? '#667085'),
      tabId: Number(status.tabId ?? status.tab_id ?? 0),
      isTerminal: Boolean(status.isTerminal ?? status.is_terminal),
    } satisfies WorkflowStatus,
    assignees: assignees.map((value) => {
      const person = asRecord(value);
      const name =
        String(person.fullName ?? '').trim() ||
        `${String(person.first_name ?? '')} ${String(person.last_name ?? '')}`.trim() ||
        String(person.email ?? 'Member');
      return {
        id: Number(person.id),
        name,
        email: String(person.email ?? ''),
        initials: name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        role: String(person.role ?? ''),
        avatarColor: '#667085',
      };
    }),
    resources: resources.map((value) => {
      const resource = asRecord(value);
      return {
        id: Number(resource.id),
        title: String(resource.title ?? 'Attachment'),
        url: typeof resource.url === 'string' ? resource.url : null,
        mimeType:
          typeof resource.mime_type === 'string' ? resource.mime_type : null,
        fileSize: Number.isFinite(Number(resource.file_size))
          ? Number(resource.file_size)
          : null,
      };
    }),
  };
};
