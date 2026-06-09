import { useAppStore } from '../../store/useAppStore';

export function CalendarList() {
  const calendars = useAppStore((s) => s.calendars);
  const members = useAppStore((s) => s.members);
  const openCalendarForm = useAppStore((s) => s.openCalendarForm);
  const toggleCalendarVisibility = useAppStore((s) => s.toggleCalendarVisibility);

  return (
    <div className="p-4 space-y-3">
      {calendars.map((cal) => (
        <div key={cal.id} className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cal.color }} />
            <span className="font-medium flex-1">{cal.name}</span>
            <button
              type="button"
              onClick={() => toggleCalendarVisibility(cal.id)}
              className={`text-xs px-2 py-0.5 rounded-full ${
                cal.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {cal.isVisible ? '표시' : '숨김'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            작성자: {cal.writerIds.map((id) => members.find((m) => m.id === id)?.name).join(', ')}
          </p>
          <button
            type="button"
            onClick={() => openCalendarForm(cal.id)}
            className="text-sm text-primary mt-2"
          >
            수정
          </button>
        </div>
      ))}
    </div>
  );
}
