export type InboxFilter = 'pending' | 'decided' | 'requested' | 'notifications';
export type ApprovalSubjectType = 'task' | 'document' | 'milestone';
export type ApprovalStatus =
  'pending' | 'approved' | 'rejected' | 'invalidated' | 'cancelled';
export interface PersonRef {
  id: number;
  name: string;
}
export interface ApprovalResponse {
  id: string;
  reviewerId: number;
  reviewer: (PersonRef & { email: string }) | null;
  decision: 'approved' | 'rejected';
  comment: string | null;
  createdAt: string;
}
export interface ApprovalItem {
  id: string;
  projectId: number;
  projectTitle: string;
  subjectType: ApprovalSubjectType;
  subjectId: string;
  subject: { id: string | number; title: string };
  status: ApprovalStatus;
  message: string | null;
  dueAt: string | null;
  requestedBy: PersonRef | null;
  reviewers: PersonRef[];
  responses: ApprovalResponse[];
  canRespond: boolean;
  createdAt: string;
}
export interface NotificationItem {
  id: number;
  title: string;
  message?: string;
  type: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}
