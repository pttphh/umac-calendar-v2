import { useRef, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  getWeekDays,
  isToday,
  toDateKey,
  formatTime,
  addWeeks,
  subWeeks,
} from '../../utils/dateUtils';
import { expandEventsForRange } from '../../utils/repeatUtils';
import { startOfWeek, endOfWeek } from 'date-fns';
import type { ExpandedEvent } from '../../types';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function WeekView() {
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const openDayPopup = useAppStore((s) => s.openDayPopup);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const lastTapRef = useRef<{ date: string; time: number } | null>(null);

  const visibleCalIds = useMemo(
    () => new Set(calendars.filter((c) => c.isVisible).map((c) => c.id)),
    [calendars]
  );
  const calColorMap = useMemo(
    () => Object.fromEntries(calendars.map((c) => [c.id, c.color])),
    [calendars]
  );

  const weekDays = getWeekDays(currentDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const expanded = useMemo(
    () =>
      expandEventsForRange(
        events.filter((e) => visibleCalIds.has(e.calendarId)),
        weekStart,
        weekEnd
      ),
    [events, visibleCalIds, weekStart, weekEnd]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, ExpandedEvent[]> = {};
    for (const ev of expanded) {
      const key = ev.occurrenceDate;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [expanded]);

  const goNextWeek = useCallback(() => {
    setCurrentDate(addWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const goPrevWeek = useCallback(() => {
    setCurrentDate(subWeeks(currentDate, 1));
  }, [currentDate, setCurrentDate]);

  const swipeHandlers = useSwipeNavigation(goNextWeek, goPrevWeek);

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
    <div
      className="flex flex-col h-full min-h-0 touch-pan-y"
      {...swipeHandlers}
    >
      {weekDays.map((day) => {
        const dateKey = toDateKey(day);
        const dayEvents = eventsByDate[dateKey] ?? [];
        const allDay = dayEvents.filter((e) => e.isAllDay);
        const timed = dayEvents
          .filter((e) => !e.isAllDay)
          .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
        const today = isToday(day);
        const dayOfWeek = day.getDay();
        const selected = selectedDate === dateKey;

        return (
          <div
            key={dateKey}
            className={`flex flex-1 min-h-0 border-b border-gray-100 ${
              selected ? 'bg-blue-50' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => handleDayTap(dateKey)}
              className="w-12 shrink-0 flex flex-col items-center justify-start pt-2 border-r border-gray-50"
            >
              <span className="text-[10px] text-gray-400">{WEEKDAY_LABELS[dayOfWeek]}</span>
              <span
                className={`w-7 h-7 flex items-center justify-center text-sm rounded-full mt-0.5 ${
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
            </button>
            <div className="flex-1 min-h-0 overflow-hidden px-2 py-1 space-y-0.5">
              {allDay.map((ev) => (
                <EventChip
                  key={ev.occurrenceKey}
                  ev={ev}
                  color={calColorMap[ev.calendarId] ?? '#999'}
                  onOpen={() => openEventDetail(ev.id)}
                  allDay
                />
              ))}
              {timed.map((ev) => (
                <EventChip
                  key={ev.occurrenceKey}
                  ev={ev}
                  color={calColorMap[ev.calendarId] ?? '#999'}
                  onOpen={() => openEventDetail(ev.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventChip({
  ev,
  color,
  onOpen,
  allDay,
}: {
  ev: ExpandedEvent;
  color: string;
  onOpen: () => void;
  allDay?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded truncate flex items-center gap-1"
      style={
        allDay || ev.isAllDay
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: `${color}33`, color }
      }
    >
      {!allDay && !ev.isAllDay && (
        <span className="shrink-0 font-medium">{formatTime(ev.startDateTime)}</span>
      )}
      <span className="truncate">{ev.title}</span>
    </button>
  );
}
