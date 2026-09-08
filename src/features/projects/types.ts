export type ProjectStatus =
  | 'active'
  | 'upcoming'
  | 'in_progress'
  | 'inactive'
  | 'completed'
  | 'cancelled'
  | 'on_hold'
  | 'paused'
  | 'on_review'
  | 'overdue'
  | 'draft';
export type ProjectHealth = 'healthy' | 'at_risk' | 'blocked';
export type PinnedProjectStatus = ProjectStatus;
export type ProjectRowStatus = ProjectStatus;

export interface ProjectAvatar {
  initials: string;
  color: string;
}

export interface PinnedProject {
  id: string;
  tag: string;
  status: PinnedProjectStatus;
  health?: ProjectHealth;
  title: string;
  description: string;
  progressPercent: number;
  progressLabel: string;
  blockerLabel?: string;
  taskCount: number;
  milestoneCount?: number;
  dueLabel: string;
  blocked?: boolean;
  avatars: ProjectAvatar[];
  extraCount?: number;
}

export interface ProjectListItem {
  id: string;
  tag: string;
  updatedLabel: string;
  title: string;
  status: ProjectRowStatus;
  statusLabel: string;
  progressPercent: number;
  taskCount: number;
}

export type ProjectDetailStatus = ProjectStatus;
export type ProjectTaskStatus =
  'Backlog' | 'Building' | 'Ready for QA' | 'Shipped';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: ProjectTaskStatus;
  priority: 'low' | 'medium' | 'high';
  dueLabel: string;
  assignee: ProjectMember;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dateLabel: string;
  completed: boolean;
}

export interface ProjectActivity {
  id: string;
  actor: string;
  description: string;
  timeLabel: string;
}

export interface ProjectDetail {
  id: string;
  tag: string;
  title: string;
  description: string;
  status: ProjectDetailStatus;
  health?: ProjectHealth;
  progressPercent: number;
  dueLabel: string;
  completedTaskCount: number;
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  activity: ProjectActivity[];
}
