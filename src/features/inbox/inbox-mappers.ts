import type {
  ApprovalItem,
  ApprovalStatus,
  ApprovalSubjectType,
} from './types';

type Row = Record<string, unknown>;
const record = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};

export const mapApproval = (value: unknown): ApprovalItem => {
  const row = record(value);
  const subject = record(row.subject ?? row.subject_snapshot);
  const requestedBy = record(row.requestedBy ?? row.requested_by);
  const reviewers = Array.isArray(row.reviewers) ? row.reviewers : [];
  const responses = Array.isArray(row.responses) ? row.responses : [];
  const projectId = Number(row.projectId ?? row.project_id);

  return {
    id: String(row.id),
    projectId,
    projectTitle: String(row.projectTitle ?? `Project ${projectId}`),
    subjectType: String(
      row.subjectType ?? row.subject_type,
    ) as ApprovalSubjectType,
    subjectId: String(row.subjectId ?? row.subject_id),
    subject: {
      id: String(subject.id ?? row.subjectId ?? row.subject_id),
      title: String(subject.title ?? 'Approval request'),
    },
    status: String(row.status ?? 'pending') as ApprovalStatus,
    message: typeof row.message === 'string' ? row.message : null,
    dueAt:
      typeof (row.dueAt ?? row.due_at) === 'string'
        ? String(row.dueAt ?? row.due_at)
        : null,
    requestedBy: requestedBy.id
      ? {
          id: Number(requestedBy.id),
          name: String(requestedBy.name ?? 'Unknown'),
        }
      : null,
    reviewers: reviewers.map((value) => {
      const reviewer = record(value);
      return {
        id: Number(reviewer.id),
        name: String(reviewer.name ?? 'Reviewer'),
      };
    }),
    responses: responses.map((value) => {
      const response = record(value);
      const reviewer = record(response.reviewer);
      return {
        id: String(response.id),
        reviewerId: Number(response.reviewerId ?? response.reviewer_id),
        reviewer: reviewer.id
          ? {
              id: Number(reviewer.id),
              name: String(reviewer.name ?? reviewer.email ?? 'Reviewer'),
              email: String(reviewer.email ?? ''),
            }
          : null,
        decision: String(response.decision) as 'approved' | 'rejected',
        comment: typeof response.comment === 'string' ? response.comment : null,
        createdAt: String(response.createdAt ?? response.created_at ?? ''),
      };
    }),
    canRespond: Boolean(row.canRespond ?? row.can_respond),
    createdAt: String(row.createdAt ?? row.created_at ?? ''),
  };
};
