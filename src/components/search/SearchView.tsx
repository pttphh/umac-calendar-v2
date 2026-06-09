import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { HighlightText } from '../common/HighlightText';
import { formatDateTime } from '../../utils/dateUtils';

type FilterType = 'all' | 'events' | 'comments' | 'memos';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'events', label: '일정' },
  { id: 'comments', label: '댓글' },
  { id: 'memos', label: '메모' },
];

export function SearchView() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const setCurrentTab = useAppStore((s) => s.setCurrentTab);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const events = useAppStore((s) => s.events);
  const comments = useAppStore((s) => s.comments);

  const q = query.trim().toLowerCase();

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

  const showEvents = filter === 'all' || filter === 'events';
  const showComments = filter === 'all' || filter === 'comments';
  const showMemos = filter === 'all' || filter === 'memos';

  return (
    <div className="pb-16">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색"
          autoFocus
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button type="button" onClick={() => setCurrentTab('calendar')} className="text-sm text-primary shrink-0">
          취소
        </button>
      </div>

      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
              filter === f.id ? 'bg-primary text-white border-primary' : 'border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {!q && <p className="text-center text-gray-400 py-12">검색어를 입력하세요</p>}

        {q && showEvents && eventResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">일정 {eventResults.length}건</h3>
            {eventResults.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => openEventDetail(ev.id)}
                className="w-full text-left py-2 border-b border-gray-50"
              >
                <p className="font-medium">
                  <HighlightText text={ev.title} query={query} />
                </p>
                <p className="text-xs text-gray-400">{formatDateTime(ev.startDateTime)}</p>
              </button>
            ))}
          </section>
        )}

        {q && showComments && commentResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">댓글 {commentResults.length}건</h3>
            {commentResults.map((c) => {
              const ev = events.find((e) => e.id === c.eventId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openEventDetail(c.eventId)}
                  className="w-full text-left py-2 border-b border-gray-50"
                >
                  <p className="text-sm">
                    <HighlightText text={c.text ?? ''} query={query} />
                  </p>
                  <p className="text-xs text-gray-400">{ev?.title}</p>
                </button>
              );
            })}
          </section>
        )}

        {q && showMemos && memoResults.length > 0 && (
          <section className="mb-4">
            <h3 className="text-xs text-gray-500 font-medium py-2">메모 {memoResults.length}건</h3>
            {memoResults.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => openEventDetail(ev.id)}
                className="w-full text-left py-2 border-b border-gray-50"
              >
                <p className="text-sm">
                  <HighlightText text={ev.memo ?? ''} query={query} />
                </p>
                <p className="text-xs text-gray-400">{ev.title}</p>
              </button>
            ))}
          </section>
        )}

        {q &&
          ((showEvents ? eventResults.length : 0) +
            (showComments ? commentResults.length : 0) +
            (showMemos ? memoResults.length : 0)) === 0 && (
            <p className="text-center text-gray-400 py-12">검색 결과가 없습니다</p>
          )}
      </div>
    </div>
  );
}
