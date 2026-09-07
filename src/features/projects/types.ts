export type PinnedProjectStatus = 'on-track' | 'attention';
export type ProjectRowStatus = 'on-track' | 'review' | 'paused';

export interface ProjectAvatar {
  initials: string;
  color: string;
}

export interface PinnedProject {
  id: string;
  tag: string;
  status: PinnedProjectStatus;
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
