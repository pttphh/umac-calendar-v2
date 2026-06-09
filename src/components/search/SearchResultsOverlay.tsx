import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { HighlightText } from '../common/HighlightText';
import { formatDateTime } from '../../utils/dateUtils';

const BOTTOM_NAV_HEIGHT = 56;

export function SearchResultsOverlay() {
  const isSearchOpen = useAppStore((s) => s.isSearchOpen);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const closeSearch = useAppStore((s) => s.closeSearch);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const events = useAppStore((s) => s.events);
  const comments = useAppStore((s) => s.comments);

  const q = searchQuery.trim().toLowerCase();

  const eventResults = useMemo(() => {
    if (!q) return [];
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, q]);

  const commentResults = useMemo(() => {
    if (!q) return [];
    return comments.filter((c) => c.text?.toLowerCase().includes(q));
  }, [comments, q]);

  const memoResults = useMemo(() => {
    if (!q) return [];
    return events.filter((e) => e.memo?.toLowerCase().includes(q));
  }, [events, q]);

  const totalCount = eventResults.length + commentResults.length + memoResults.length;

  const handleSelect = (eventId: string) => {
    closeSearch();
    openEventDetail(eventId);
  };

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 bg-white/95 backdrop-blur-sm overflow-y-auto"
      style={{ bottom: `${BOTTOM_NAV_HEIGHT}px` }}
    >
      <div className="max-w-[480px] mx-auto px-4 py-3">
        {!q && (
          <p className="text-center text-gray-400 py-12 text-sm">검색어를 입력하세요</p>
        )}

        {q && totalCount === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">검색 결과가 없습니다</p>
        )}

        {q && eventResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">일정 {eventResults.length}건</h3>
            {eventResults.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleSelect(ev.id)}
                className="w-full text-left py-2.5 border-b border-gray-50"
              >
                <p className="font-medium text-sm">
                  <HighlightText text={ev.title} query={searchQuery} />
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ev.startDateTime)}</p>
              </button>
            ))}
          </section>
        )}

        {q && commentResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">댓글 {commentResults.length}건</h3>
            {commentResults.map((c) => {
              const ev = events.find((e) => e.id === c.eventId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.eventId)}
                  className="w-full text-left py-2.5 border-b border-gray-50"
                >
                  <p className="text-sm">
                    <HighlightText text={c.text ?? ''} query={searchQuery} />
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{ev?.title}</p>
                </button>
              );
            })}
          </section>
        )}

        {q && memoResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">메모 {memoResults.length}건</h3>
            {memoResults.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleSelect(ev.id)}
                className="w-full text-left py-2.5 border-b border-gray-50"
              >
                <p className="text-sm">
                  <HighlightText text={ev.memo ?? ''} query={searchQuery} />
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{ev.title}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
