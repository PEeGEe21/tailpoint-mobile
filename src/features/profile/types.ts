export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  organization: string;
}

export interface ProfilePreference {
  key: 'approvalRequestedPush' | 'deadlineReminderPush';
  notificationType: 'approval_requested' | 'deadline_reminder';
  channel: 'push';
  title: string;
  description: string;
  defaultValue: boolean;
}
