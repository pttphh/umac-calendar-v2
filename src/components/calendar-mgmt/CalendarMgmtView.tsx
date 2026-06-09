import { ArrowLeft, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CalendarList } from './CalendarList';

export function CalendarMgmtView() {
  const isOpen = useAppStore((s) => s.isCalendarMgmtOpen);
  const closeCalendarMgmt = useAppStore((s) => s.closeCalendarMgmt);
  const openCalendarForm = useAppStore((s) => s.openCalendarForm);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[85] bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <button type="button" onClick={closeCalendarMgmt} className="p-1 -ml-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">캘린더 관리</h1>
        <button type="button" onClick={() => openCalendarForm()} className="p-1 -mr-1 text-primary">
          <Plus size={22} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        <CalendarList />
      </div>
    </div>
  );
}
