import { Calendar, MessageCircle, Building2, Settings, Search } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../store/useAppStore';
import type { AppTab } from '../../types';

const tabs: { id: AppTab; label: string; icon: typeof Calendar }[] = [
  { id: 'calendar', label: '캘린더', icon: Calendar },
  { id: 'feed', label: '피드', icon: MessageCircle },
  { id: 'meeting', label: '미팅처', icon: Building2 },
  { id: 'more', label: '설정', icon: Settings },
];

export function BottomNav() {
  const {
    currentTab,
    setCurrentTab,
    isEventFormOpen,
    showEventDetail,
    isMeetingFormOpen,
    isCalendarFormOpen,
    dayPopupDate,
    unreadCount,
  } = useAppStore(
    useShallow((s) => ({
      currentTab: s.currentTab,
      setCurrentTab: s.setCurrentTab,
      isEventFormOpen: s.isEventFormOpen,
      showEventDetail: s.showEventDetail,
      isMeetingFormOpen: s.isMeetingFormOpen,
      isCalendarFormOpen: s.isCalendarFormOpen,
      dayPopupDate: s.dayPopupDate,
      unreadCount: s.notifications.filter((n) => !n.isRead).length,
    }))
  );

  const hidden =
    isEventFormOpen ||
    showEventDetail ||
    isMeetingFormOpen ||
    isCalendarFormOpen ||
    !!dayPopupDate;

  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 z-50 items-center ${
        hidden ? 'hidden' : 'flex'
      }`}
      aria-hidden={hidden}
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setCurrentTab(id)}
          className={`flex-1 flex flex-col items-center py-2 relative ${
            currentTab === id ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <Icon size={22} />
            {id === 'feed' && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-unread text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{label}</span>
        </button>
      ))}
      <div className="w-px h-8 bg-gray-200" />
      <button
        type="button"
        onClick={() => setCurrentTab('search')}
        className={`w-14 flex flex-col items-center py-2 ${
          currentTab === 'search' ? 'text-primary' : 'text-gray-500'
        }`}
      >
        <Search size={22} />
      </button>
    </nav>
  );
}
