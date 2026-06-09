import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Member,
  Calendar,
  CalendarEvent,
  MeetingContact,
  Comment,
  ActivityLog,
  FeedNotification,
  AppTab,
} from '../types';
import { CURRENT_USER_ID } from '../types';
import {
  seedMembers,
  seedCalendars,
  seedEvents,
  seedMeetingContacts,
  seedComments,
  seedNotifications,
} from '../data/seed';
import { generateId } from '../utils/id';

interface AppStore {
  members: Member[];
  calendars: Calendar[];
  events: CalendarEvent[];
  meetingContacts: MeetingContact[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  notifications: FeedNotification[];

  currentDate: Date;
  selectedEventId: string | null;
  dayPopupDate: string | null;
  isEventFormOpen: boolean;
  editingEventId: string | null;
  eventFormDefaultDate: string | null;
  currentTab: AppTab;
  isListView: boolean;
  selectedMeetingId: string | null;
  isMeetingFormOpen: boolean;
  editingMeetingId: string | null;
  isCalendarFormOpen: boolean;
  editingCalendarId: string | null;
  showEventDetail: boolean;

  unreadCount: number;

  setCurrentDate: (date: Date) => void;
  setCurrentTab: (tab: AppTab) => void;
  setListView: (v: boolean) => void;
  setSelectedEventId: (id: string | null) => void;
  openEventDetail: (id: string) => void;
  closeEventDetail: () => void;
  openEventForm: (eventId?: string, defaultDate?: string) => void;
  closeEventForm: () => void;
  openMeetingDetail: (id: string) => void;
  closeMeetingDetail: () => void;
  openMeetingForm: (id?: string) => void;
  closeMeetingForm: () => void;
  openCalendarForm: (id?: string) => void;
  closeCalendarForm: () => void;

  addCalendar: (cal: Omit<Calendar, 'id'>) => void;
  updateCalendar: (id: string, updates: Partial<Calendar>) => void;
  toggleCalendarVisibility: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  addMeetingContact: (mc: Omit<MeetingContact, 'id'>) => void;
  updateMeetingContact: (id: string, updates: Partial<MeetingContact>) => void;
  markAllNotificationsRead: () => void;
  openDayPopup: (date: string) => void;
  closeDayPopup: () => void;
}

function getCurrentUserName(members: Member[]): string {
  return members.find((m) => m.id === CURRENT_USER_ID)?.name ?? '사용자';
}

function createEventNotification(
  type: FeedNotification['type'],
  event: CalendarEvent,
  message: string
): FeedNotification {
  return {
    id: generateId('n'),
    type,
    eventId: event.id,
    eventTitle: event.title,
    targetMemberIds: event.notifyMemberIds.filter((id) => id !== CURRENT_USER_ID),
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      members: seedMembers,
      calendars: seedCalendars,
      events: seedEvents,
      meetingContacts: seedMeetingContacts,
      comments: seedComments,
      activityLogs: [],
      notifications: seedNotifications,

      currentDate: new Date('2026-06-09'),
      selectedEventId: null,
      dayPopupDate: null,
      isEventFormOpen: false,
      editingEventId: null,
      eventFormDefaultDate: null,
      currentTab: 'calendar',
      isListView: false,
      selectedMeetingId: null,
      isMeetingFormOpen: false,
      editingMeetingId: null,
      isCalendarFormOpen: false,
      editingCalendarId: null,
      showEventDetail: false,

      unreadCount: 0,

      setCurrentDate: (date) => set({ currentDate: date }),
      setCurrentTab: (tab) => {
        set((s) => ({
          currentTab: tab,
          notifications:
            tab === 'feed'
              ? s.notifications.map((n) => ({ ...n, isRead: true }))
              : s.notifications,
        }));
      },
      setListView: (v) => set({ isListView: v }),
      setSelectedEventId: (id) => set({ selectedEventId: id }),

      openEventDetail: (id) =>
        set({ selectedEventId: id, showEventDetail: true, dayPopupDate: null }),
      closeEventDetail: () => set({ selectedEventId: null, showEventDetail: false }),

      openEventForm: (eventId, defaultDate) =>
        set({
          isEventFormOpen: true,
          editingEventId: eventId ?? null,
          eventFormDefaultDate: defaultDate ?? null,
          dayPopupDate: null,
        }),
      closeEventForm: () =>
        set({ isEventFormOpen: false, editingEventId: null, eventFormDefaultDate: null }),

      openMeetingDetail: (id) => set({ selectedMeetingId: id }),
      closeMeetingDetail: () => set({ selectedMeetingId: null }),
      openMeetingForm: (id) =>
        set({ isMeetingFormOpen: true, editingMeetingId: id ?? null }),
      closeMeetingForm: () =>
        set({ isMeetingFormOpen: false, editingMeetingId: null }),

      openCalendarForm: (id) =>
        set({ isCalendarFormOpen: true, editingCalendarId: id ?? null }),
      closeCalendarForm: () =>
        set({ isCalendarFormOpen: false, editingCalendarId: null }),

      addCalendar: (cal) => {
        const id = generateId('cal');
        set((s) => ({ calendars: [...s.calendars, { ...cal, id }] }));
      },

      updateCalendar: (id, updates) => {
        set((s) => ({
          calendars: s.calendars.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      toggleCalendarVisibility: (id) => {
        set((s) => ({
          calendars: s.calendars.map((c) =>
            c.id === id ? { ...c, isVisible: !c.isVisible } : c
          ),
        }));
      },

      addEvent: (event) => {
        const now = new Date().toISOString();
        const id = generateId('e');
        const newEvent: CalendarEvent = { ...event, id, createdAt: now, updatedAt: now };
        const actorName = getCurrentUserName(get().members);
        const log: ActivityLog = {
          id: generateId('log'),
          eventId: id,
          action: 'created',
          actionLabel: '일정을 등록했습니다',
          actorName,
          createdAt: now,
        };
        const notif = createEventNotification(
          'event_created',
          newEvent,
          `${actorName}님이 일정을 등록했습니다`
        );
        set((s) => ({
          events: [...s.events, newEvent],
          activityLogs: [...s.activityLogs, log],
          notifications: [...s.notifications, notif],
        }));
      },

      updateEvent: (id, updates) => {
        const now = new Date().toISOString();
        const actorName = getCurrentUserName(get().members);
        let updatedEvent: CalendarEvent | undefined;
        set((s) => {
          const events = s.events.map((e) => {
            if (e.id === id) {
              updatedEvent = { ...e, ...updates, updatedAt: now };
              return updatedEvent;
            }
            return e;
          });
          const log: ActivityLog = {
            id: generateId('log'),
            eventId: id,
            action: 'updated',
            actionLabel: '일정을 수정했습니다',
            actorName,
            createdAt: now,
          };
          const notif = updatedEvent
            ? createEventNotification(
                'event_updated',
                updatedEvent,
                `${actorName}님이 일정을 수정했습니다`
              )
            : null;
          return {
            events,
            activityLogs: [...s.activityLogs, log],
            notifications: notif ? [...s.notifications, notif] : s.notifications,
          };
        });
      },

      deleteEvent: (id) => {
        const event = get().events.find((e) => e.id === id);
        if (!event) return;
        const now = new Date().toISOString();
        const actorName = getCurrentUserName(get().members);
        const log: ActivityLog = {
          id: generateId('log'),
          eventId: id,
          action: 'deleted',
          actionLabel: '일정을 삭제했습니다',
          actorName,
          createdAt: now,
        };
        const notif = createEventNotification(
          'event_deleted',
          event,
          `${actorName}님이 일정을 삭제했습니다`
        );
        set((s) => ({
          events: s.events.filter((e) => e.id !== id),
          activityLogs: [...s.activityLogs, log],
          notifications: [...s.notifications, notif],
        }));
      },

      addComment: (comment) => {
        const now = new Date().toISOString();
        const id = generateId('cmt');
        const newComment: Comment = { ...comment, id, createdAt: now };
        const event = get().events.find((e) => e.id === comment.eventId);
        if (!event) return;

        const commenterIds = get()
          .comments.filter((c) => c.eventId === comment.eventId)
          .map((c) => c.authorId);
        const targetIds = [
          ...new Set([...event.notifyMemberIds, ...commenterIds, comment.authorId]),
        ].filter((mid) => mid !== CURRENT_USER_ID);

        const textPreview = comment.text
          ? comment.text.slice(0, 20) + (comment.text.length > 20 ? '...' : '')
          : '이미지를 첨부했습니다';
        const notif: FeedNotification = {
          id: generateId('n'),
          type: 'comment_added',
          eventId: event.id,
          eventTitle: event.title,
          targetMemberIds: targetIds,
          message: `${comment.authorName}님이 댓글을 달았습니다: "${textPreview}"`,
          isRead: false,
          createdAt: now,
        };

        set((s) => ({
          comments: [...s.comments, newComment],
          notifications: [...s.notifications, notif],
        }));
      },

      addMeetingContact: (mc) => {
        const id = generateId('mc');
        set((s) => ({
          meetingContacts: [...s.meetingContacts, { ...mc, id }],
        }));
      },

      updateMeetingContact: (id, updates) => {
        set((s) => ({
          meetingContacts: s.meetingContacts.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      openDayPopup: (date) => set({ dayPopupDate: date }),
      closeDayPopup: () => set({ dayPopupDate: null }),
    }),
    {
      name: 'umac-calendar-store',
      partialize: (state) => ({
        members: state.members,
        calendars: state.calendars,
        events: state.events,
        meetingContacts: state.meetingContacts,
        comments: state.comments,
        activityLogs: state.activityLogs,
        notifications: state.notifications,
        currentDate: state.currentDate,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore>;
        return {
          ...current,
          ...p,
          currentDate: p.currentDate ? new Date(p.currentDate as unknown as string) : current.currentDate,
        };
      },
    }
  )
);

export function useUnreadCount(): number {
  return useAppStore((s) => s.notifications.filter((n) => !n.isRead).length);
}
