import type { ProfilePreference, UserProfile } from './types';

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Jordan Davis',
  email: 'jordan@acmestudio.com',
  initials: 'JD',
  role: 'member',
  organization: 'Acme Studio',
};

export const MOCK_PROFILE_PREFERENCES: ProfilePreference[] = [
  {
    key: 'approvalRequestedPush',
    notificationType: 'approval_requested',
    channel: 'push',
    title: 'Approval requests',
    description: 'Push notifications when your review is requested',
    defaultValue: true,
  },
  {
    key: 'deadlineReminderPush',
    notificationType: 'deadline_reminder',
    channel: 'push',
    title: 'Deadline reminders',
    description: 'Push notifications for upcoming due dates',
    defaultValue: false,
  },
];
