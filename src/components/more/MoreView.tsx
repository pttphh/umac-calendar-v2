import { ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CURRENT_USER_ID } from '../../types';

export function MoreView() {
  const members = useAppStore((s) => s.members);
  const setCurrentTab = useAppStore((s) => s.setCurrentTab);
  const openCalendarForm = useAppStore((s) => s.openCalendarForm);
  const currentUser = members.find((m) => m.id === CURRENT_USER_ID);

  const sections = [
    {
      title: '개인',
      items: [
        { label: '내 프로필', action: () => {} },
        { label: '로그아웃', action: () => {} },
      ],
    },
    {
      title: '관리',
      items: [
        { label: '캘린더 관리', action: () => openCalendarForm() },
        { label: '미팅처 관리', action: () => setCurrentTab('meeting') },
        { label: '상품 관리 (추후 설정 예정)', action: () => {}, disabled: true },
      ],
    },
    {
      title: '앱',
      items: [
        { label: '알림 설정', action: () => {} },
        { label: '앱 설정', action: () => {} },
      ],
    },
  ];

  return (
    <div className="pb-16 bg-gray-50 min-h-full">
      <header className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-lg font-semibold">설정</h1>
      </header>

      {currentUser && (
        <div className="flex items-center gap-3 px-4 py-4 mt-3 mx-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name[0]}
          </div>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-gray-500">영업팀</p>
          </div>
        </div>
      )}

      <div className="px-3 pt-3 space-y-3">
        {sections.map((section) => (
          <section
            key={section.title}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <h2 className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {section.title}
            </h2>
            <div className="divide-y divide-gray-100">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  disabled={item.disabled}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 disabled:opacity-40"
                >
                  <span className="text-sm">{item.label}</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
