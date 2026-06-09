import { useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  getCalendarDays,
  isToday,
  isSameMonth,
  toDateKey,
} from '../../utils/dateUtils';
import { expandEventsForRange } from '../../utils/repeatUtils';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { ExpandedEvent } from '../../types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarGrid() {
  const currentDate = useAppStore((s) => s.currentDate);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const openDayPopup = useAppStore((s) => s.openDayPopup);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const lastTapRef = useRef<{ date: string; time: number } | null>(null);

  const visibleCalIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const calColorMap = Object.fromEntries(calendars.map((c) => [c.id, c.color]));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = getCalendarDays(currentDate);
  const expanded = expandEventsForRange(
    events.filter((e) => visibleCalIds.has(e.calendarId)),
    monthStart,
    monthEnd
  );

  const eventsByDate: Record<string, ExpandedEvent[]> = {};
  for (const ev of expanded) {
    const key = ev.occurrenceDate;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  const handleDayTap = (dateKey: string) => {
    const now = Date.now();
    const last = lastTapRef.current;
    if (last && last.date === dateKey && now - last.time < 350) {
      openDayPopup(dateKey);
      lastTapRef.current = null;
    } else {
      setSelectedDate(dateKey);
      lastTapRef.current = { date: dateKey, time: now };
    }
  };

  return (
    <div className="px-1">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs py-1 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = eventsByDate[dateKey] ?? [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const selected = selectedDate === dateKey;

          const dayOfWeek = day.getDay();

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayTap(dateKey)}
              className={`relative min-h-[60px] border-[0.5px] border-gray-100 p-0.5 text-left align-top ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${selected ? 'bg-blue-50' : ''}`}
            >
              <div className="absolute top-0.5 left-0 right-0 flex justify-center z-10 pointer-events-none">
                <span
                  className={`w-6 h-6 flex items-center justify-center text-xs rounded-full ${
                    today
                      ? 'bg-primary text-white font-bold'
                      : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                          ? 'text-blue-500'
                          : ''
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="pt-7 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => {
                  const color = calColorMap[ev.calendarId] ?? '#999';
                  return (
                    <div
                      key={ev.occurrenceKey}
                      className="text-[10px] leading-tight px-0.5 py-px rounded truncate"
                      style={
                        ev.isAllDay
                          ? { backgroundColor: color, color: '#fff' }
                          : { backgroundColor: `${color}33`, color }
                      }
                    >
                      {ev.title.slice(0, 5)}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-gray-400 text-center">+{dayEvents.length - 3}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
