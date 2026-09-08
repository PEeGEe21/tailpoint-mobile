export type TaskSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface WorkflowStatus {
  id: number;
  title: string;
  color: string;
  tabId: number;
  isTerminal: boolean;
}
export interface ProjectMember {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: string;
  avatarColor: string;
}
/** Mirrors the task API payload while retaining project context from the route. */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: number;
  severity: TaskSeverity | null;
  due_date: string | null;
  organization_id: string;
  status: WorkflowStatus;
  assignees: ProjectMember[];
  project: { id: number; title: string };
}
