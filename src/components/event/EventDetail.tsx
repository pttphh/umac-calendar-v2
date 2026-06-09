import { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Camera, Send, Paperclip } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime, formatTime } from '../../utils/dateUtils';
import { CURRENT_USER_ID } from '../../types';
import { parseISO, format } from 'date-fns';

export function EventDetail() {
  const showEventDetail = useAppStore((s) => s.showEventDetail);
  const selectedEventId = useAppStore((s) => s.selectedEventId);
  const closeEventDetail = useAppStore((s) => s.closeEventDetail);
  const openEventForm = useAppStore((s) => s.openEventForm);
  const deleteEvent = useAppStore((s) => s.deleteEvent);
  const addComment = useAppStore((s) => s.addComment);
  const events = useAppStore((s) => s.events);
  const calendars = useAppStore((s) => s.calendars);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const comments = useAppStore((s) => s.comments);
  const activityLogs = useAppStore((s) => s.activityLogs);
  const members = useAppStore((s) => s.members);

  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const event = events.find((e) => e.id === selectedEventId);
  const cal = event ? calendars.find((c) => c.id === event.calendarId) : null;
  const mc = event?.meetingContactId
    ? meetingContacts.find((m) => m.id === event.meetingContactId)
    : null;
  const currentUser = members.find((m) => m.id === CURRENT_USER_ID);
  const canEdit = cal?.writerIds.includes(CURRENT_USER_ID);

  const timeline = useMemo(() => {
    if (!event) return [];
    const evComments = comments
      .filter((c) => c.eventId === event.id)
      .map((c) => ({ type: 'comment' as const, data: c, date: c.createdAt }));
    const evLogs = activityLogs
      .filter((l) => l.eventId === event.id)
      .map((l) => ({ type: 'log' as const, data: l, date: l.createdAt }));

    const created = {
      type: 'log' as const,
      data: {
        id: 'created',
        eventId: event.id,
        action: 'created' as const,
        actionLabel: '일정을 등록했습니다',
        actorName: members.find((m) => cal?.writerIds.includes(m.id))?.name ?? '사용자',
        createdAt: event.createdAt,
      },
      date: event.createdAt,
    };

    return [...evLogs, created, ...evComments].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [event, comments, activityLogs, members, cal]);

  const handleSend = () => {
    if (!commentText.trim() || !event || !currentUser) return;
    addComment({
      eventId: event.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: commentText.trim(),
    });
    setCommentText('');
  };

  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event || !currentUser) return;
    const url = URL.createObjectURL(file);
    addComment({
      eventId: event.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      imageUrl: url,
    });
    e.target.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event || !currentUser) return;
    addComment({
      eventId: event.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: `📎 ${file.name}`,
    });
    e.target.value = '';
  };

  if (!showEventDetail || !event) return null;

  let lastDateLabel = '';
  const getDateLabel = (iso: string) =>
    format(parseISO(iso), 'M월 d일 (EEE)', { locale: undefined });

  return (
    <div className="fixed inset-0 z-[90] bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button type="button" onClick={closeEventDetail}>
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="h-1 w-8 rounded mb-1" style={{ backgroundColor: cal?.color }} />
          <h1 className="font-bold truncate">{event.title}</h1>
          <p className="text-sm text-gray-500">
            {event.isAllDay
              ? formatDateTime(event.startDateTime)
              : `${formatDateTime(event.startDateTime)} - ${formatTime(event.endDateTime)}`}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEventForm(event.id)}
              className="text-sm text-primary"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => { deleteEvent(event.id); closeEventDetail(); }}
              className="text-sm text-red-500"
            >
              삭제
            </button>
          </div>
        )}
      </header>

      {/* 메타 정보 (캘린더 | 미팅처) */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-500 border-b border-gray-100">
        <span>{cal?.name}</span>
        {mc && (
          <>
            <span>|</span>
            <span>{mc.name}</span>
          </>
        )}
      </div>

      {/* 메모 인라인 표시 (팝업 제거) */}
      {event.memo && (
        <div className="mx-4 mt-3 mb-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-700 font-medium mb-1">📝 메모</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.memo}</p>
        </div>
      )}

      {/* 타임라인 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
        {timeline.map((item) => {
          const dateLabel = getDateLabel(item.date);
          const showPill = dateLabel !== lastDateLabel;
          if (showPill) lastDateLabel = dateLabel;

          return (
            <div key={item.type === 'comment' ? item.data.id : item.data.id + item.date}>
              {showPill && (
                <div className="flex justify-center my-3">
                  <span className="px-3 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                    {dateLabel}
                  </span>
                </div>
              )}
              {item.type === 'log' ? (
                <p className="text-sm text-gray-500 text-center py-1">
                  {item.data.actorName}님이 {item.data.actionLabel}
                </p>
              ) : (
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                    style={{
                      backgroundColor:
                        members.find((m) => m.id === item.data.authorId)?.color ?? '#999',
                    }}
                  >
                    {item.data.authorName[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{item.data.authorName}</p>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm max-w-[260px]">
                      {item.data.text}
                      {item.data.imageUrl && (
                        <img
                          src={item.data.imageUrl}
                          alt="첨부"
                          className="mt-2 rounded max-w-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 입력바 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200">
        {/* 이미지 첨부 */}
        <button type="button" onClick={handleImageAttach} className="text-gray-500">
          <Camera size={22} />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {/* 파일 첨부 */}
        <button type="button" onClick={handleFileAttach} className="text-gray-500">
          <Paperclip size={22} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="댓글 입력"
          className="flex-1 border rounded-full px-4 py-2 text-sm"
        />
        <button type="button" onClick={handleSend} className="text-primary">
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}