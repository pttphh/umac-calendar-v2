import { useState, useMemo } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime, formatEventSchedule, formatFeedDateTime } from '../../utils/dateUtils';
import { countUnreadCommentNotificationsForEvent } from '../../utils/notifications';

const INTERNAL_GROUP_KEY = '__internal__';

interface FeedEventItem {
  eventId: string;
  title: string;
  startDateTime: string;
  isAllDay: boolean;
  calendarColor: string;
  unreadCount: number;
  latestComment: {
    text: string;
    authorName: string;
    createdAt: string;
  };
}

interface FeedGroup {
  key: string;
  name: string;
  unreadCount: number;
  latestCommentTime: string;
  latestCommentPreview: string;
  events: FeedEventItem[];
}

export function FeedView() {
  const [subTab, setSubTab] = useState<'comments' | 'files'>('comments');
  const [mcFilter, setMcFilter] = useState<string | null>(null);
  const [expandedOverride, setExpandedOverride] = useState<Record<string, boolean>>({});
  const notifications = useAppStore((s) => s.notifications);
  const comments = useAppStore((s) => s.comments);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const feedGroups = useMemo((): FeedGroup[] => {
    const eventIdsWithComments = [...new Set(comments.map((c) => c.eventId))];
    const groupMap = new Map<string, FeedGroup>();

    for (const eventId of eventIdsWithComments) {
      const event = events.find((e) => e.id === eventId);
      if (!event) continue;

      const evComments = comments
        .filter((c) => c.eventId === eventId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const latest = evComments[0];
      if (!latest) continue;

      const groupKey = event.meetingContactId ?? INTERNAL_GROUP_KEY;
      const cal = calendars.find((c) => c.id === event.calendarId);
      const unreadCount = countUnreadCommentNotificationsForEvent(
        notifications,
        eventId,
        currentUserId
      );

      const commentText = latest.text ?? (latest.imageUrl ? '이미지를 첨부했습니다' : '');

      const eventItem: FeedEventItem = {
        eventId,
        title: event.title,
        startDateTime: event.startDateTime,
        isAllDay: event.isAllDay,
        calendarColor: cal?.color ?? '#999',
        unreadCount,
        latestComment: {
          text: commentText,
          authorName: latest.authorName,
          createdAt: latest.createdAt,
        },
      };

      const existing = groupMap.get(groupKey);
      if (existing) {
        existing.events.push(eventItem);
        existing.unreadCount += unreadCount;
        if (latest.createdAt > existing.latestCommentTime) {
          existing.latestCommentTime = latest.createdAt;
          existing.latestCommentPreview = commentText;
        }
      } else {
        const mc =
          groupKey === INTERNAL_GROUP_KEY
            ? null
            : meetingContacts.find((m) => m.id === groupKey);
        groupMap.set(groupKey, {
          key: groupKey,
          name: mc?.name ?? '내부',
          unreadCount,
          latestCommentTime: latest.createdAt,
          latestCommentPreview: commentText,
          events: [eventItem],
        });
      }
    }

    return [...groupMap.values()]
      .map((group) => ({
        ...group,
        events: group.events.sort((a, b) =>
          b.startDateTime.localeCompare(a.startDateTime)
        ),
      }))
      .sort((a, b) => b.latestCommentTime.localeCompare(a.latestCommentTime));
  }, [notifications, events, calendars, meetingContacts, comments, currentUserId]);

  const isGroupExpanded = (group: FeedGroup) => {
    if (group.key in expandedOverride) return expandedOverride[group.key];
    return group.unreadCount > 0;
  };

  const toggleGroup = (key: string, currentlyExpanded: boolean) => {
    setExpandedOverride((prev) => ({ ...prev, [key]: !currentlyExpanded }));
  };

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
          {feedGroups.length === 0 ? (
            <p className="text-center text-gray-400 py-12">댓글이 있는 일정이 없습니다</p>
          ) : (
            feedGroups.map((group) => {
              const expanded = isGroupExpanded(group);
              const hasUnread = group.unreadCount > 0;
              return (
                <div key={group.key} className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key, expanded)}
                    className="w-full px-4 py-3 bg-white text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate ${
                          hasUnread ? 'font-bold text-primary' : 'text-gray-400'
                        }`}
                      >
                        {group.name}
                      </span>
                      <span className="flex-1" />
                      {expanded ? (
                        <ChevronDown size={18} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400 shrink-0" />
                      )}
                    </div>
                    {!expanded && group.latestCommentPreview && (
                      <p className="text-xs text-gray-400 mt-1 truncate pr-6">
                        {group.latestCommentPreview}
                      </p>
                    )}
                  </button>

                  {expanded && (
                    <div className="px-4 pb-3 flex flex-col gap-2">
                      {group.events.map((item) => (
                        <FeedEventCard
                          key={item.eventId}
                          item={item}
                          onOpen={openEventDetail}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
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

interface FeedEventCardProps {
  item: FeedEventItem;
  onOpen: (id: string) => void;
}

function FeedEventCard({ item, onOpen }: FeedEventCardProps) {
  const { latestComment } = item;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className="w-full flex text-left bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
    >
      <div
        className="w-1 shrink-0 self-stretch rounded-l-lg"
        style={{ backgroundColor: item.calendarColor, minWidth: 4 }}
      />
      <div className="flex-1 min-w-0 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-[16px] text-gray-900 truncate leading-snug">
            {item.title}
          </p>
          {item.unreadCount > 0 && (
            <span className="shrink-0 min-w-[22px] h-[22px] px-1 bg-unread text-white text-xs font-bold rounded-full flex items-center justify-center">
              {item.unreadCount}
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-500 mt-1">
          {formatEventSchedule(item.startDateTime, item.isAllDay)}
        </p>
        <p className="text-[14px] text-gray-900 mt-2 truncate leading-snug">
          {latestComment.text}
        </p>
        <p className="text-[12px] text-gray-400 mt-1 truncate">
          {latestComment.authorName} · {formatFeedDateTime(latestComment.createdAt)}
        </p>
      </div>
    </button>
  );
}
