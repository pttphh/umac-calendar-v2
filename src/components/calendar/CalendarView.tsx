import { CalendarHeader } from './CalendarHeader';
import { CalendarFilterChips } from './CalendarFilterChips';
import { CalendarGrid } from './CalendarGrid';
import { WeekView } from './WeekView';
import { DayPopup } from './DayPopup';
import { useAppStore } from '../../store/useAppStore';

/** 하단 네비게이션 바 높이 (px) */
const BOTTOM_NAV_HEIGHT = 56;

export function CalendarView() {
  const calendarViewMode = useAppStore((s) => s.calendarViewMode);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: `calc(100dvh - ${BOTTOM_NAV_HEIGHT}px)` }}
    >
      <CalendarHeader />
      <CalendarFilterChips />
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {calendarViewMode === 'month' ? <CalendarGrid /> : <WeekView />}
      </div>
      <DayPopup />
    </div>
  );
}
