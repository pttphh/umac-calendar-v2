import { useState } from 'react';
import { ChevronDown, CalendarDays, CalendarRange } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  formatMonthYear,
  formatWeekRange,
  addMonths,
  subMonths,
} from '../../utils/dateUtils';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function CalendarHeader() {
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const calendarViewMode = useAppStore((s) => s.calendarViewMode);
  const setCalendarViewMode = useAppStore((s) => s.setCalendarViewMode);
  const [showDropdown, setShowDropdown] = useState(false);

  const year = currentDate.getFullYear();
  const isWeek = calendarViewMode === 'week';

  return (
    <div className="relative shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 text-lg font-semibold"
        >
          {isWeek ? formatWeekRange(currentDate) : formatMonthYear(currentDate)}
          <ChevronDown
            size={18}
            className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setCalendarViewMode(isWeek ? 'month' : 'week')}
          className="p-2 text-gray-600"
          aria-label={isWeek ? '월간 보기' : '주간 보기'}
        >
          {isWeek ? <CalendarDays size={22} /> : <CalendarRange size={22} />}
        </button>
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
          <div className="absolute left-4 top-full z-30 bg-white rounded-lg shadow-lg border border-gray-100 p-3 w-56">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setCurrentDate(subMonths(currentDate, 12))}
                className="px-2 py-1 text-sm"
              >
                ◀
              </button>
              <span className="font-medium">{year}년</span>
              <button
                type="button"
                onClick={() => setCurrentDate(addMonths(currentDate, 12))}
                className="px-2 py-1 text-sm"
              >
                ▶
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(m - 1);
                    setCurrentDate(d);
                    setShowDropdown(false);
                  }}
                  className={`py-2 rounded text-sm ${
                    currentDate.getMonth() + 1 === m
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
