import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils/dateUtils';
import { countUnreadCommentNotificationsForEvent } from '../../utils/notifications';

export function FeedView() {
  const [subTab, setSubTab] = useState<'comments' | 'files'>('comments');
  const [mcFilter, setMcFilter] = useState<string | null>(null);
  const notifications = useAppStore((s) => s.notifications);
  const comments = useAppStore((s) => s.comments);
  const events = useAppStore((s) => s.events);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const members = useAppStore((s) => s.members);
  const calendars = useAppStore((s) => s.calendars);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const feedItems = useMemo(() => {
    const eventIdsWithComments = [...new Set(comments.map((c) => c.eventId))];

    return eventIdsWithComments
      .map((eventId) => {
        const event = events.find((e) => e.id === eventId);
        const mc = event?.meetingContactId
          ? meetingContacts.find((m) => m.id === event.meetingContactId)
          : null;
        const evComments = comments
          .filter((c) => c.eventId === eventId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const latest = evComments[0];
        const cal = event ? calendars.find((c) => c.id === event.calendarId) : null;
        const writer = event
          ? members.find((m) => cal?.writerIds.includes(m.id)) ?? null
          : null;

        const sortTime = latest?.createdAt ?? event?.createdAt ?? '';

        const unreadCount = countUnreadCommentNotificationsForEvent(
          notifications,
          eventId,
          currentUserId
        );

        const preview = latest
          ? `${latest.authorName}: ${latest.text ?? '이미지를 첨부했습니다'}`
          : '';

        return {
          eventId,
          sortTime,
          event,
          mc,
          latest,
          writer,
          preview,
          unreadCount,
          displayTime: latest?.createdAt ?? event?.createdAt ?? '',
        };
      })
      .sort((a, b) => b.sortTime.localeCompare(a.sortTime));
  }, [notifications, events, meetingContacts, comments, calendars, members, currentUserId]);

  const imageComments = comments.filter((c) => c.imageUrl);
  const docComments = comments.filter((c) => c.text && c.text.includes('문서'));

  const filteredImages = mcFilter
    ? imageComments.filter((c) => {
        const ev = events.find((e) => e.id === c.eventId);
        return ev?.meetingContactId === mcFilter;
      })
    : imageComments;

  return (
    <div className="pb-16">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold">피드</h1>
        <Filter size={20} className="text-gray-500" />
      </header>

      <div className="flex border-b border-gray-100">
        {(['comments', 'files'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium ${
              subTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
            }`}
          >
            {tab === 'comments' ? '댓글' : '첨부파일'}
          </button>
        ))}
      </div>

      {subTab === 'comments' ? (
        <div>
          {feedItems.length === 0 ? (
            <p className="text-center text-gray-400 py-12">댓글이 있는 일정이 없습니다</p>
          ) : (
            feedItems.map((item) => (
              <FeedItem key={item.eventId} item={item} onOpen={openEventDetail} />
            ))
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setMcFilter(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
                !mcFilter ? 'bg-primary text-white border-primary' : 'border-gray-300'
              }`}
            >
              전체
            </button>
            {meetingContacts.map((mc) => (
              <button
                key={mc.id}
                type="button"
                onClick={() => setMcFilter(mc.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs border ${
                  mcFilter === mc.id ? 'bg-primary text-white border-primary' : 'border-gray-300'
                }`}
              >
                {mc.name}
              </button>
            ))}
          </div>

          {filteredImages.length > 0 && (
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 mb-2">이미지</p>
              <div className="grid grid-cols-3 gap-2">
                {filteredImages.map((c) => {
                  const ev = events.find((e) => e.id === c.eventId);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => ev && openEventDetail(ev.id)}
                      className="text-left"
                    >
                      <img src={c.imageUrl} alt="" className="w-full aspect-square object-cover rounded" />
                      <p className="text-[10px] text-gray-500 mt-1 truncate">{ev?.title}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-3 py-2">
            <p className="text-xs text-gray-500 mb-2">문서</p>
            {docComments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">문서가 없습니다</p>
            ) : (
              docComments.map((c) => {
                const ev = events.find((e) => e.id === c.eventId);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => ev && openEventDetail(ev.id)}
                    className="flex items-center gap-3 w-full py-2 border-b border-gray-50"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">📄</div>
                    <div className="text-left">
                      <p className="text-sm">{ev?.title}</p>
                      <p className="text-xs text-gray-400">{ev && formatDateTime(ev.startDateTime)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FeedItemProps {
  item: {
    eventId: string;
    event?: { title: string; createdAt?: string };
    mc?: { name: string } | null;
    writer?: { name: string; color: string } | null;
    preview: string;
    unreadCount: number;
    displayTime: string;
  };
  onOpen: (id: string) => void;
}

function FeedItem({ item, onOpen }: FeedItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className="w-full text-left bg-white py-3 px-4 border-b border-gray-100"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-gray-900 truncate">{item.event?.title}</span>
            {item.displayTime && (
              <span className="text-xs text-gray-400 shrink-0">
                {formatDateTime(item.displayTime)}
              </span>
            )}
          </div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {item.mc && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {item.mc.name}
              </span>
            )}
            {item.writer && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: item.writer.color }}
              >
                {item.writer.name}
              </span>
            )}
          </div>
          {item.preview && (
            <p className="text-sm text-gray-500 mt-1.5 truncate">{item.preview}</p>
          )}
        </div>
        {item.unreadCount > 0 && (
          <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-unread text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
            {item.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
