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

export type ProjectStatus =
  | 'active'
  | 'upcoming'
  | 'in_progress'
  | 'on_review'
  | 'inactive'
  | 'paused'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'overdue'
  | 'draft';
export type ProjectHealth = 'healthy' | 'at_risk' | 'blocked';

export interface ProjectAvatar {
  initials: string;
  color: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  status: ProjectStatus;
  health?: ProjectHealth;
  progressLabel: string;
  progressPercent: number;
  avatars: ProjectAvatar[];
  extraCount?: number;
  updatedLabel: string;
}

export type TaskBucket = 'all' | 'today' | 'upcoming' | 'later';
export interface TaskItem {
  id: number;
  bucket: TaskBucket;
  category: string;
  title: string;
  priority: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  dueLabel: string;
  overdue?: boolean;
  blockedBy?: string;
  commentCount?: number;
  checklist?: { done: number; total: number };
  completed?: boolean;
  statusLabel: string;
  attachmentCount: number;
}
