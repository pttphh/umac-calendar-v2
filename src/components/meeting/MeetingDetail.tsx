import { useState } from 'react';
import { ArrowLeft, Edit2, Send, Camera } from 'lucide-react';
import { useAppStore, useCurrentUserId } from '../../store/useAppStore';
import { formatDateTime } from '../../utils/dateUtils';
import { parseISO, isBefore, startOfDay } from 'date-fns';

type DetailTab = 'events' | 'comments' | 'files' | 'info';

export function MeetingDetail() {
  const selectedMeetingId = useAppStore((s) => s.selectedMeetingId);
  const closeMeetingDetail = useAppStore((s) => s.closeMeetingDetail);
  const openMeetingForm = useAppStore((s) => s.openMeetingForm);
  const openEventDetail = useAppStore((s) => s.openEventDetail);
  const addComment = useAppStore((s) => s.addComment);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const events = useAppStore((s) => s.events);
  const comments = useAppStore((s) => s.comments);
  const members = useAppStore((s) => s.members);
  const calendars = useAppStore((s) => s.calendars);
  const currentUserId = useCurrentUserId();

  const [tab, setTab] = useState<DetailTab>('events');
  const [commentText, setCommentText] = useState('');

  const mc = meetingContacts.find((m) => m.id === selectedMeetingId);
  if (!mc) return null;

  const mcEvents = events
    .filter((e) => e.meetingContactId === mc.id)
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  const today = startOfDay(new Date());
  const upcoming = mcEvents.filter((e) => !isBefore(parseISO(e.startDateTime.slice(0, 10)), today) || e.startDateTime.slice(0, 10) === today.toISOString().slice(0, 10));
  const past = mcEvents.filter((e) => isBefore(parseISO(e.startDateTime.slice(0, 10)), today));

  const mcComments = comments
    .filter((c) => mcEvents.some((e) => e.id === c.eventId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const imageComments = mcComments.filter((c) => c.imageUrl);
  const currentUser = members.find((m) => m.id === currentUserId);

  const handleSend = () => {
    if (!commentText.trim() || mcEvents.length === 0 || !currentUser) return;
    addComment({
      eventId: mcEvents[mcEvents.length - 1].id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: commentText.trim(),
    });
    setCommentText('');
  };

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'events', label: '일정' },
    { id: 'comments', label: '댓글' },
    { id: 'files', label: '파일' },
    { id: 'info', label: '정보' },
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col">
      <header className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button type="button" onClick={closeMeetingDetail}>
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold">{mc.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{mc.category}</span>
              <span className="text-xs text-gray-500">담당: {mc.managerName}</span>
            </div>
          </div>
          <button type="button" onClick={() => openMeetingForm(mc.id)}>
            <Edit2 size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <div className="flex border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm ${
              tab === t.id ? 'text-primary border-b-2 border-primary font-medium' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {tab === 'events' && (
          <div className="p-4 space-y-4">
            <section>
              <h3 className="text-xs text-gray-500 font-medium mb-2">예정</h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400">예정된 일정이 없습니다</p>
              ) : (
                upcoming.map((ev) => {
                  const cal = calendars.find((c) => c.id === ev.calendarId);
                  const writer = members.find((m) => cal?.writerIds.includes(m.id));
                  const cnt = comments.filter((c) => c.eventId === ev.id).length;
                  return (
                    <EventRow key={ev.id} ev={ev} writer={writer} commentCount={cnt} onOpen={openEventDetail} />
                  );
                })
              )}
            </section>
            <section>
              <h3 className="text-xs text-gray-500 font-medium mb-2">지난 일정</h3>
              {past.map((ev) => {
                const cal = calendars.find((c) => c.id === ev.calendarId);
                const writer = members.find((m) => cal?.writerIds.includes(m.id));
                const cnt = comments.filter((c) => c.eventId === ev.id).length;
                return (
                  <EventRow key={ev.id} ev={ev} writer={writer} commentCount={cnt} onOpen={openEventDetail} dimmed />
                );
              })}
            </section>
          </div>
        )}

        {tab === 'comments' && (
          <div className="p-4">
            {mcEvents.map((ev) => {
              const evComments = mcComments.filter((c) => c.eventId === ev.id);
              if (evComments.length === 0) return null;
              return (
                <div key={ev.id} className="mb-4">
                  <h4 className="text-sm font-medium mb-2">{ev.title}</h4>
                  {evComments.map((c) => (
                    <div key={c.id} className="flex gap-2 mb-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: members.find((m) => m.id === c.authorId)?.color }}
                      >
                        {c.authorName[0]}
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex-1">
                        <p className="text-xs text-gray-500">{c.authorName}</p>
                        {c.text}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'files' && (
          <div className="p-4">
            {imageComments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {imageComments.map((c) => {
                  const ev = events.find((e) => e.id === c.eventId);
                  return (
                    <div key={c.id}>
                      <img src={c.imageUrl} alt="" className="w-full aspect-square object-cover rounded" />
                      <p className="text-[10px] text-gray-500 mt-1 truncate">{ev?.title}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-sm text-gray-400 text-center py-4">문서 없음</p>
          </div>
        )}

        {tab === 'info' && (
          <div className="p-4 space-y-3 text-sm">
            <InfoRow label="담당자" value={mc.managerName} />
            <InfoRow label="연락처" value={mc.phone} />
            <InfoRow label="이메일" value={mc.email} />
            <InfoRow label="주소" value={mc.address} />
            <InfoRow label="메모" value={mc.memo} />
          </div>
        )}
      </div>

      {tab === 'comments' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center gap-2 px-4 py-3 bg-white border-t">
          <Camera size={22} className="text-gray-500" />
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글 입력"
            className="flex-1 border rounded-full px-4 py-2 text-sm"
          />
          <button type="button" onClick={handleSend} className="text-primary">
            <Send size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

function EventRow({
  ev,
  writer,
  commentCount,
  onOpen,
  dimmed,
}: {
  ev: { id: string; title: string; startDateTime: string };
  writer?: { name: string; color: string };
  commentCount: number;
  onOpen: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ev.id)}
      className={`w-full flex items-center justify-between py-2 border-b border-gray-50 text-left ${dimmed ? 'opacity-50' : ''}`}
    >
      <div>
        <p className="text-sm font-medium">{ev.title}</p>
        <p className="text-xs text-gray-500">{formatDateTime(ev.startDateTime)}</p>
      </div>
      <div className="flex items-center gap-2">
        {writer && (
          <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: writer.color }}>
            {writer.name}
          </span>
        )}
        {commentCount > 0 && (
          <span className="text-xs text-gray-400">💬 {commentCount}</span>
        )}
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p>{value}</p>
    </div>
  );
}
