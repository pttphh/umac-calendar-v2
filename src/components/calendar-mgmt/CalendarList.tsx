import { useAppStore, useCurrentUserId } from '../../store/useAppStore';

export function CalendarList() {
  const currentUserId = useCurrentUserId();
  const calendars = useAppStore((s) => s.calendars);
  const openCalendarForm = useAppStore((s) => s.openCalendarForm);
  const deleteCalendar = useAppStore((s) => s.deleteCalendar);

  if (calendars.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16 text-sm">등록된 캘린더가 없습니다</p>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {calendars.map((cal) => {
        const isWriter = cal.writerIds.includes(currentUserId);
        const isViewer = !isWriter && cal.viewerIds.includes(currentUserId);

        return (
          <div
            key={cal.id}
            className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: cal.color }}
              />
              <span className="font-medium flex-1 truncate">{cal.name}</span>
              {isWriter && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                  작성자
                </span>
              )}
              {isViewer && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium shrink-0">
                  공유받음
                </span>
              )}
            </div>

            {isWriter && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => openCalendarForm(cal.id)}
                  className="text-sm text-primary"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`"${cal.name}" 캘린더를 삭제하시겠습니까?`)) {
                      deleteCalendar(cal.id);
                    }
                  }}
                  className="text-sm text-red-500"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
