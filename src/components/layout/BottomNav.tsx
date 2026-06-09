import { useEffect, useRef } from 'react';
import { Calendar, MessageCircle, Building2, Settings, Search, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useUnreadCount } from '../../store/useAppStore';
import type { AppTab } from '../../types';

const tabs: { id: AppTab; label: string; icon: typeof Calendar }[] = [
  { id: 'calendar', label: '캘린더', icon: Calendar },
  { id: 'feed', label: '피드', icon: MessageCircle },
  { id: 'meeting', label: '미팅처', icon: Building2 },
  { id: 'more', label: '설정', icon: Settings },
];

export function BottomNav() {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentTab,
    setCurrentTab,
    isEventFormOpen,
    showEventDetail,
    isMeetingFormOpen,
    isCalendarFormOpen,
    isCalendarMgmtOpen,
    dayPopupDate,
    isSearchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    setSearchQuery,
  } = useAppStore(
    useShallow((s) => ({
      currentTab: s.currentTab,
      setCurrentTab: s.setCurrentTab,
      isEventFormOpen: s.isEventFormOpen,
      showEventDetail: s.showEventDetail,
      isMeetingFormOpen: s.isMeetingFormOpen,
      isCalendarFormOpen: s.isCalendarFormOpen,
      isCalendarMgmtOpen: s.isCalendarMgmtOpen,
      dayPopupDate: s.dayPopupDate,
      isSearchOpen: s.isSearchOpen,
      searchQuery: s.searchQuery,
      openSearch: s.openSearch,
      closeSearch: s.closeSearch,
      setSearchQuery: s.setSearchQuery,
    }))
  );

  const unreadCount = useUnreadCount();

  const hidden =
    isEventFormOpen ||
    showEventDetail ||
    isMeetingFormOpen ||
    isCalendarFormOpen ||
    isCalendarMgmtOpen ||
    !!dayPopupDate;

  useEffect(() => {
    if (isSearchOpen && !hidden) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    }
  }, [isSearchOpen, hidden]);

  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 z-50 h-14 overflow-hidden ${
        hidden ? 'hidden' : 'block'
      }`}
      aria-hidden={hidden}
    >
      <div className="relative h-full flex items-center">
        {/* 탭 영역 */}
        <div
          className={`flex flex-1 items-center h-full transition-all duration-200 ease-in-out ${
            isSearchOpen ? 'opacity-0 w-0 min-w-0 overflow-hidden pointer-events-none' : 'opacity-100 w-auto'
          }`}
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
          <div className="w-px h-8 bg-gray-200 shrink-0" />
        </div>

        {/* 검색 확장 패널 (우측 → 전체) */}
        <div
          className={`absolute top-0 bottom-0 right-0 flex items-center bg-white transition-all duration-200 ease-in-out ${
            isSearchOpen ? 'left-0 px-3 gap-2 border-t border-gray-200' : 'w-14'
          }`}
        >
          {isSearchOpen ? (
            <>
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="일정, 댓글, 메모 검색"
                className="flex-1 min-w-0 outline-none text-sm bg-transparent"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="p-1 text-gray-500 shrink-0"
                aria-label="검색 닫기"
              >
                <X size={22} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={openSearch}
              className="w-14 h-full flex flex-col items-center justify-center text-gray-500"
              aria-label="검색"
            >
              <Search size={22} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
