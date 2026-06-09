export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  writerIds: string[];
  viewerIds: string[];
}

export interface MeetingContact {
  id: string;
  name: string;
  category: string;
  managerName: string;
  phone?: string;
  email?: string;
  address?: string;
  memo?: string;
  defaultNotifyIds: string[];
}

export interface RepeatRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  nthWeekday?: { nth: number; weekday: number };
  endType: 'forever' | 'until' | 'count';
  endDate?: string;
  endCount?: number;
  additionalRules?: RepeatRule[];
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  memo?: string;
  isAllDay: boolean;
  startDateTime: string;
  endDateTime: string;
  meetingContactId?: string;
  notifyMemberIds: string[];
  repeat?: RepeatRule;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  eventId: string;
  action: 'created' | 'updated' | 'deleted';
  actionLabel: string;
  actorName: string;
  createdAt: string;
}

export interface FeedNotification {
  id: string;
  type: 'event_created' | 'event_updated' | 'event_deleted' | 'comment_added';
  eventId: string;
  eventTitle: string;
  targetMemberIds: string[];
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type AppTab = 'calendar' | 'feed' | 'meeting' | 'more' | 'search';

export interface ExpandedEvent extends CalendarEvent {
  occurrenceDate: string;
  occurrenceKey: string;
}

export const CURRENT_USER_ID = 'm1';
