import { useState, useMemo } from 'react';
import { Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateChip, formatDateTime } from '../../utils/dateUtils';
import { countUnreadCommentNotificationsForEvent } from '../../utils/notifications';

const INTERNAL_GROUP_KEY = '__internal__';

interface FeedEventItem {
  eventId: string;
  title: string;
  startDateTime: string;
  preview: string;
  unreadCount: number;
}

interface FeedGroup {
  key: string;
  name: string;
  unreadCount: number;
  latestCommentTime: string;
  events: FeedEventItem[];
}

export function FeedView() {
  const [subTab, setSubTab] = useState<'comments' | 'files'>('comments');
  const [mcFilter, setMcFilter] = useState<string | null>(null);
  const [expandedOverride, setExpandedOverride] = useState<Record<string, boolean>>({});
  const notifications = useAppStore((s) => s.notifications);
  const comments = useAppStore((s) => s.comments);
  const events = useAppStore((s) => s.events);
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
      const unreadCount = countUnreadCommentNotificationsForEvent(
        notifications,
        eventId,
        currentUserId
      );

      const preview = `${latest.authorName}: ${latest.text ?? '이미지를 첨부했습니다'}`;

      const eventItem: FeedEventItem = {
        eventId,
        title: event.title,
        startDateTime: event.startDateTime,
        preview,
        unreadCount,
      };

      const existing = groupMap.get(groupKey);
      if (existing) {
        existing.events.push(eventItem);
        existing.unreadCount += unreadCount;
        if (latest.createdAt > existing.latestCommentTime) {
          existing.latestCommentTime = latest.createdAt;
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
  }, [notifications, events, meetingContacts, comments, currentUserId]);

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
              return (
                <div key={group.key} className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key, expanded)}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 text-left"
                  >
                    {expanded ? (
                      <ChevronDown size={18} className="text-gray-500 shrink-0" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-500 shrink-0" />
                    )}
                    <span className="font-bold text-gray-900 flex-1 truncate">{group.name}</span>
                    {group.unreadCount > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-unread text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {group.unreadCount}
                      </span>
                    )}
                  </button>

                  {expanded &&
                    group.events.map((item) => (
                      <FeedEventRow
                        key={item.eventId}
                        item={item}
                        onOpen={openEventDetail}
                      />
                    ))}
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

interface FeedEventRowProps {
  item: FeedEventItem;
  onOpen: (id: string) => void;
}

function FeedEventRow({ item, onOpen }: FeedEventRowProps) {
  const hasUnread = item.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className={`w-full text-left py-3 pr-4 pl-4 bg-white border-t border-gray-50 ${
        hasUnread ? 'border-l-[3px] border-l-primary' : 'border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-medium text-gray-900 truncate">{item.title}</span>
        <span className="text-gray-300 shrink-0">·</span>
        <span className="text-sm text-gray-500 shrink-0">
          {formatDateChip(item.startDateTime)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1 truncate">{item.preview}</p>
    </button>
  );
}
