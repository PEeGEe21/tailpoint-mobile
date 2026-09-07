import type { MaterialIcons } from '@expo/vector-icons';

export type InboxFilter = 'pending' | 'decided' | 'requested' | 'notifications';
export type ApprovalStatus = 'pending' | 'approved' | 'changes' | 'rejected';

export interface ApprovalItem {
  id: string;
  project: string;
  reference: string;
  accentColor: string;
  dueLabel: string;
  dueTone: 'warning' | 'neutral';
  title: string;
  description: string;
  requester: {
    initials: string;
    name: string;
    role: string;
    avatarColor: string;
  };
  badge?: {
    icon?: keyof typeof MaterialIcons.glyphMap;
    label: string;
    tone: 'success' | 'neutral';
  };
  meta?: {
    leftIcon: keyof typeof MaterialIcons.glyphMap;
    leftLabel: string;
    middleIcon?: keyof typeof MaterialIcons.glyphMap;
    middleLabel?: string;
    actionLabel?: string;
  };
  status: ApprovalStatus;
}

export interface ActivityItem {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  detail?: string;
  time: string;
  unread?: boolean;
}
