import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MeetingDetail } from './MeetingDetail';
const CATEGORIES = ['전체', '고객사', '파트너', '공급사'];

export function MeetingView() {
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const events = useAppStore((s) => s.events);
  const notifications = useAppStore((s) => s.notifications);
  const openMeetingDetail = useAppStore((s) => s.openMeetingDetail);
  const openMeetingForm = useAppStore((s) => s.openMeetingForm);
  const selectedMeetingId = useAppStore((s) => s.selectedMeetingId);

  const filtered = meetingContacts.filter(
    (m) => categoryFilter === '전체' || m.category === categoryFilter
  );

  if (selectedMeetingId) {
    return <MeetingDetail />;
  }

  return (
    <div className="pb-16">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold">미팅처</h1>
        <button type="button" onClick={() => openMeetingForm()} className="p-1">
          <Plus size={22} className="text-primary" />
        </button>
      </header>

      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoryFilter(c)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
              categoryFilter === c ? 'bg-primary text-white border-primary' : 'border-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.map((mc) => {
          const mcEvents = events.filter((e) => e.meetingContactId === mc.id);
          const latestEvent = mcEvents.sort((a, b) =>
            b.startDateTime.localeCompare(a.startDateTime)
          )[0];
          const unread = notifications.filter(
            (n) => !n.isRead && mcEvents.some((e) => e.id === n.eventId)
          ).length;

          return (
            <button
              key={mc.id}
              type="button"
              onClick={() => openMeetingDetail(mc.id)}
              className="w-full text-left px-4 py-3 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mc.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full">{mc.category}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  담당: {mc.managerName}
                  {latestEvent && (
                    <> · 최근 일정 {latestEvent.startDateTime.slice(5, 10).replace('-', '/')}</>
                  )}
                </p>
              </div>
              {unread > 0 && (
                <span className="min-w-[18px] h-[18px] bg-unread text-white text-[10px] rounded-full flex items-center justify-center px-1">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
