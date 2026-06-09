import { CalendarHeader } from './CalendarHeader';
import { CalendarFilterChips } from './CalendarFilterChips';
import { CalendarGrid } from './CalendarGrid';
import { ListView } from './ListView';
import { DayPopup } from './DayPopup';
import { useAppStore } from '../../store/useAppStore';

export function CalendarView() {
  const isListView = useAppStore((s) => s.isListView);

  return (
    <div className="pb-16">
      <CalendarHeader />
      <CalendarFilterChips />
      {isListView ? <ListView /> : <CalendarGrid />}
      <DayPopup />
    </div>
  );
}
