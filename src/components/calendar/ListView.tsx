import { useAppStore } from '../../store/useAppStore';
import { expandEventsForRange } from '../../utils/repeatUtils';
import { formatDateTime, formatTime } from '../../utils/dateUtils';
import { startOfMonth, endOfMonth } from 'date-fns';

export function ListView() {
  const currentDate = useAppStore((s) => s.currentDate);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const meetingContacts = useAppStore((s) => s.meetingContacts);

  const visibleCalIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const calMap = Object.fromEntries(calendars.map((c) => [c.id, c]));
  const mcMap = Object.fromEntries(meetingContacts.map((m) => [m.id, m]));

  const expanded = expandEventsForRange(
    events.filter((e) => visibleCalIds.has(e.calendarId)),
    startOfMonth(currentDate),
    endOfMonth(currentDate)
  );

  return (
    <div className="px-4 pb-4 space-y-2">
      {expanded.length === 0 && (
        <p className="text-center text-gray-400 py-8">이번 달 일정이 없습니다</p>
      )}
      {expanded.map((ev) => {
        const cal = calMap[ev.calendarId];
        const mc = ev.meetingContactId ? mcMap[ev.meetingContactId] : null;
        return (
          <button
            key={ev.occurrenceKey}
            type="button"
            onClick={() => openEventDetail(ev.id)}
            className="w-full flex gap-3 p-3 border border-gray-100 rounded-lg text-left"
          >
            <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: cal?.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{ev.title}</p>
              <p className="text-sm text-gray-500">
                {ev.isAllDay
                  ? formatDateTime(ev.startDateTime).split(' ').slice(0, 2).join(' ')
                  : `${formatDateTime(ev.startDateTime)} - ${formatTime(ev.endDateTime)}`}
              </p>
              {mc && <p className="text-sm text-gray-400 mt-0.5">{mc.name}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
