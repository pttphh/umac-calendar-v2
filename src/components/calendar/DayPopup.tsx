import { Building2, MessageSquare, StickyNote } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { BottomSheet } from '../common/BottomSheet';
import { formatDateLong, formatTime } from '../../utils/dateUtils';
import { getEventsForDate } from '../../utils/repeatUtils';

export function DayPopup() {
  const dayPopupDate = useAppStore((s) => s.dayPopupDate);
  const closeDayPopup = useAppStore((s) => s.closeDayPopup);
  const openEventForm = useAppStore((s) => s.openEventForm);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const comments = useAppStore((s) => s.comments);
  const members = useAppStore((s) => s.members);

  if (!dayPopupDate) return null;

  const visibleCalIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const dayEvents = getEventsForDate(
    events.filter((e) => visibleCalIds.has(e.calendarId)),
    dayPopupDate
  );
  const calMap = Object.fromEntries(calendars.map((c) => [c.id, c]));
  const mcMap = Object.fromEntries(meetingContacts.map((m) => [m.id, m]));

  return (
    <BottomSheet open={!!dayPopupDate} onClose={closeDayPopup}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div>
          <h2 className="font-semibold">{formatDateLong(dayPopupDate)}</h2>
          <p className="text-sm text-gray-500">일정 {dayEvents.length}건</p>
        </div>
        <button
          type="button"
          onClick={() => openEventForm(undefined, dayPopupDate)}
          className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg"
        >
          일정 추가
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {dayEvents.length === 0 && (
          <p className="text-center text-gray-400 py-8">등록된 일정이 없습니다</p>
        )}
        {dayEvents.map((ev) => {
          const cal = calMap[ev.calendarId];
          const mc = ev.meetingContactId ? mcMap[ev.meetingContactId] : null;
          const evComments = comments.filter((c) => c.eventId === ev.id);
          const latestComment = evComments.sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          )[0];
          const writer = members.find((m) => cal?.writerIds.includes(m.id));

          return (
            <button
              key={ev.occurrenceKey}
              type="button"
              onClick={() => openEventDetail(ev.id)}
              className="w-full text-left border border-gray-100 rounded-lg p-3"
            >
              <div className="flex gap-2">
                <div className="w-[3px] rounded-full shrink-0" style={{ backgroundColor: cal?.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{ev.title}</span>
                    {writer && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white shrink-0"
                        style={{ backgroundColor: writer.color }}
                      >
                        {writer.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ev.isAllDay ? '종일' : `${formatTime(ev.startDateTime)} - ${formatTime(ev.endDateTime)}`}
                  </p>
                  {mc && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Building2 size={14} />
                      {mc.name}
                    </p>
                  )}
                  {ev.memo && (
                    <p className="text-sm text-gray-500 mt-1 flex items-start gap-1">
                      <StickyNote size={14} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{ev.memo}</span>
                    </p>
                  )}
                  {latestComment && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span className="truncate">{latestComment.text}</span>
                      {evComments.length > 1 && (
                        <span className="shrink-0">({evComments.length})</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
