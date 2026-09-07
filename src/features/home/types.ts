export type AttentionKind = 'critical' | 'blocked' | 'approval';

export interface AttentionItem {
  id: string;
  kind: AttentionKind;
  badgeLabel: string;
  meta: string;
  title: string;
  subtitle: string;
  actionLabel: string;
}

export type ProjectStatus = 'on-track' | 'attention' | 'off-track';

export interface ProjectAvatar {
  initials: string;
  color: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  status: ProjectStatus;
  progressLabel: string;
  progressPercent: number;
  avatars: ProjectAvatar[];
  extraCount?: number;
  updatedLabel: string;
}

export type TaskBucket = 'today' | 'upcoming' | 'later';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  bucket: TaskBucket;
  category: string;
  title: string;
  priority: TaskPriority;
  dueLabel: string;
  overdue?: boolean;
  blockedBy?: string;
  commentCount?: number;
  checklist?: { done: number; total: number };
  completed?: boolean;
}
