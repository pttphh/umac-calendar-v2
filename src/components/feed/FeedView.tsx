import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils/dateUtils';
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

  const { unreadItems, readItems } = useMemo(() => {
    // 목록: 댓글이 하나라도 있는 일정 전체 (내 댓글 포함)
    const eventIdsWithComments = [
      ...new Set(comments.map((c) => c.eventId)),
    ];

    const items = eventIdsWithComments.map((eventId) => {
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

      const eventNotifs = notifications.filter((n) => n.eventId === eventId);
      const latestNotif = [...eventNotifs].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )[0];

      const latestCommentTime = latest?.createdAt ?? '';
      const latestNotifTime = latestNotif?.createdAt ?? '';
      const sortTime =
        latestCommentTime > latestNotifTime ? latestCommentTime : latestNotifTime;

      // 미읽음 배지: 타인 댓글 알림(comment_added)만 카운트 (내 댓글은 알림 미생성)
      const unreadCount = eventNotifs.filter(
        (n) => !n.isRead && n.type === 'comment_added'
      ).length;

      return {
        eventId,
        isUnread: unreadCount > 0,
        sortTime,
        event,
        mc,
        latest,
        writer,
        commentCount: evComments.length,
        unreadCount,
      };
    });

    const sortDesc = (a: { sortTime: string }, b: { sortTime: string }) =>
      b.sortTime.localeCompare(a.sortTime);

    return {
      unreadItems: items.filter((i) => i.isUnread).sort(sortDesc),
      readItems: items.filter((i) => !i.isUnread).sort(sortDesc),
    };
  }, [notifications, events, meetingContacts, comments, calendars, members]);

  const imageComments = comments.filter((c) => c.imageUrl);
  const docComments = comments.filter((c) => c.text && c.text.includes('문서'));

  const filteredImages = mcFilter
    ? imageComments.filter((c) => {
        const ev = events.find((e) => e.id === c.eventId);
        return ev?.meetingContactId === mcFilter;
      })
    : imageComments;

  const hasFeedItems = unreadItems.length > 0 || readItems.length > 0;

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
          {unreadItems.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-medium">읽지 않음</div>
              {unreadItems.map((item) => (
                <FeedItem key={item.eventId} item={item} onOpen={openEventDetail} isRead={false} />
              ))}
            </>
          )}
          {readItems.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 font-medium">읽음</div>
              {readItems.map((item) => (
                <FeedItem key={item.eventId} item={item} onOpen={openEventDetail} isRead />
              ))}
            </>
          )}
          {!hasFeedItems && (
            <p className="text-center text-gray-400 py-12">댓글이 있는 일정이 없습니다</p>
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
    event?: { title: string; startDateTime: string };
    mc?: { name: string } | null;
    writer?: { name: string; color: string } | null;
    latest?: { text?: string };
    commentCount: number;
    unreadCount: number;
  };
  onOpen: (id: string) => void;
  isRead: boolean;
}

function FeedItem({ item, onOpen, isRead }: FeedItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className={`relative w-full text-left py-3 pl-4 pr-4 border-b border-gray-100 ${
        isRead ? 'bg-gray-50 text-gray-400' : 'bg-white'
      }`}
    >
      {!isRead && (
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
      )}
      <div className="flex justify-between items-start">
        <span className={isRead ? 'text-gray-400' : 'font-semibold text-gray-900'}>
          {item.event?.title}
        </span>
        <span className={`text-xs shrink-0 ml-2 ${isRead ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.event && formatDateTime(item.event.startDateTime)}
        </span>
      </div>
      <div className="flex gap-1.5 mt-1">
        {item.mc && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              isRead ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {item.mc.name}
          </span>
        )}
        {item.writer && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full text-white ${
              isRead ? 'opacity-60' : ''
            }`}
            style={{ backgroundColor: item.writer.color }}
          >
            {item.writer.name}
          </span>
        )}
      </div>
      {item.latest?.text && (
        <p className={`text-sm mt-2 line-clamp-2 ${isRead ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.latest.text}
        </p>
      )}
      {!isRead && item.unreadCount > 0 && (
        <span className="inline-flex mt-1 min-w-[18px] h-[18px] bg-unread text-white text-[10px] rounded-full items-center justify-center px-1">
          {item.unreadCount}
        </span>
      )}
    </button>
  );
}
