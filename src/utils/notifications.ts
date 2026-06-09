import type { FeedNotification } from '../types';

export function countUnreadCommentNotifications(
  notifications: FeedNotification[],
  currentUserId: string
): number {
  return notifications.filter(
    (n) =>
      !n.isRead &&
      n.type === 'comment_added' &&
      n.targetMemberIds.includes(currentUserId)
  ).length;
}

export function countUnreadCommentNotificationsForEvent(
  notifications: FeedNotification[],
  eventId: string,
  currentUserId: string
): number {
  return notifications.filter(
    (n) =>
      n.eventId === eventId &&
      !n.isRead &&
      n.type === 'comment_added' &&
      n.targetMemberIds.includes(currentUserId)
  ).length;
}
