import { useAppStore } from '../../store/useAppStore';

export function CalendarFilterChips() {
  const calendars = useAppStore((s) => s.calendars);
  const toggleCalendarVisibility = useAppStore((s) => s.toggleCalendarVisibility);

  return (
    <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
      {calendars.map((cal) => (
        <button
          key={cal.id}
          type="button"
          onClick={() => toggleCalendarVisibility(cal.id)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-opacity ${
            cal.isVisible ? 'text-white' : 'text-gray-400 opacity-40'
          }`}
          style={{ backgroundColor: cal.isVisible ? cal.color : '#e0e0e0' }}
        >
          {cal.name}
        </button>
      ))}
    </div>
  );
}
