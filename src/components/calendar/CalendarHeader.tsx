import { useState } from 'react';
import { ChevronDown, List, LayoutGrid } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  formatMonthYear,
  addMonths,
  subMonths,
} from '../../utils/dateUtils';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function CalendarHeader() {
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const isListView = useAppStore((s) => s.isListView);
  const setListView = useAppStore((s) => s.setListView);
  const [showDropdown, setShowDropdown] = useState(false);

  const year = currentDate.getFullYear();

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 text-lg font-semibold"
        >
          {formatMonthYear(currentDate)}
          <ChevronDown size={18} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => setListView(!isListView)}
          className="p-2 text-gray-600"
        >
          {isListView ? <LayoutGrid size={22} /> : <List size={22} />}
        </button>
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
          <div className="absolute left-4 top-full z-30 bg-white rounded-lg shadow-lg border border-gray-100 p-3 w-56">
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={() => setCurrentDate(subMonths(currentDate, 12))} className="px-2 py-1 text-sm">
                ◀
              </button>
              <span className="font-medium">{year}년</span>
              <button type="button" onClick={() => setCurrentDate(addMonths(currentDate, 12))} className="px-2 py-1 text-sm">
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
