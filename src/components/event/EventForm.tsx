import { useState, useMemo } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FormHeader } from '../common/FormHeader';
import { MemberPill } from '../common/MemberPill';
import type { RepeatRule, CalendarEvent } from '../../types';
import { CURRENT_USER_ID } from '../../types';

const REPEAT_LABELS: Record<string, string> = {
  none: '안함',
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
  custom: '사용자화',
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function EventForm() {
  const isOpen = useAppStore((s) => s.isEventFormOpen);
  const editingEventId = useAppStore((s) => s.editingEventId);
  const defaultDate = useAppStore((s) => s.eventFormDefaultDate);
  const closeEventForm = useAppStore((s) => s.closeEventForm);
  const addEvent = useAppStore((s) => s.addEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);
  const calendars = useAppStore((s) => s.calendars);
  const events = useAppStore((s) => s.events);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const addMeetingContact = useAppStore((s) => s.addMeetingContact);
  const members = useAppStore((s) => s.members);

  const existing = editingEventId ? events.find((e) => e.id === editingEventId) : null;
  const writableCals = calendars.filter((c) => c.writerIds.includes(CURRENT_USER_ID));

  const initDate = defaultDate ?? '2026-06-09';
  const [calendarId, setCalendarId] = useState(existing?.calendarId ?? writableCals[0]?.id ?? 'cal1');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [isAllDay, setIsAllDay] = useState(existing?.isAllDay ?? false);
  const [startDate, setStartDate] = useState(
    existing?.startDateTime.slice(0, 10) ?? initDate
  );
  const [startTime, setStartTime] = useState(
    existing?.startDateTime.slice(11, 16) ?? '10:00'
  );
  const [endDate, setEndDate] = useState(existing?.endDateTime.slice(0, 10) ?? initDate);
  const [endTime, setEndTime] = useState(existing?.endDateTime.slice(11, 16) ?? '11:00');
  const [memo, setMemo] = useState(existing?.memo ?? '');
  const [meetingContactId, setMeetingContactId] = useState(existing?.meetingContactId ?? '');
  const [mcSearch, setMcSearch] = useState('');
  const [showMcDropdown, setShowMcDropdown] = useState(false);
  const [notifyIds, setNotifyIds] = useState<string[]>(existing?.notifyMemberIds ?? []);
  const [memberSearch, setMemberSearch] = useState('');
  const [showRepeat, setShowRepeat] = useState(!!existing?.repeat);
  const [repeatType, setRepeatType] = useState<string>(
    existing?.repeat?.frequency ?? 'none'
  );
  const [repeatInterval, setRepeatInterval] = useState(existing?.repeat?.interval ?? 1);
  const [repeatDays, setRepeatDays] = useState<number[]>(
    existing?.repeat?.daysOfWeek ?? [1]
  );
  const [showCalDropdown, setShowCalDropdown] = useState(false);

  const selectedCal = calendars.find((c) => c.id === calendarId);
  const selectedMc = meetingContacts.find((m) => m.id === meetingContactId);

  const mcFiltered = useMemo(() => {
    if (!mcSearch.trim()) return meetingContacts;
    const q = mcSearch.toLowerCase();
    return meetingContacts.filter(
      (m) => m.name.toLowerCase().includes(q) || m.managerName.toLowerCase().includes(q)
    );
  }, [mcSearch, meetingContacts]);

  const memberFiltered = useMemo(() => {
    if (!memberSearch.trim()) return [];
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) && !notifyIds.includes(m.id)
    );
  }, [memberSearch, members, notifyIds]);

  const handleMcSelect = (id: string) => {
    setMeetingContactId(id);
    const mc = meetingContacts.find((m) => m.id === id);
    if (mc) setNotifyIds(mc.defaultNotifyIds);
    setMcSearch('');
    setShowMcDropdown(false);
  };

  const handleMcCreate = () => {
    const name = mcSearch.trim();
    if (!name) return;
    const newMc = {
      name,
      category: '고객사',
      managerName: '',
      defaultNotifyIds: [CURRENT_USER_ID],
    };
    addMeetingContact(newMc);
    const created = useAppStore.getState().meetingContacts.find((m) => m.name === name);
    if (created) handleMcSelect(created.id);
  };

  const buildRepeat = (): RepeatRule | undefined => {
    if (repeatType === 'none') return undefined;
    const freq = repeatType === 'custom' ? 'weekly' : (repeatType as RepeatRule['frequency']);
    return {
      frequency: freq,
      interval: repeatInterval,
      daysOfWeek: freq === 'weekly' || repeatType === 'custom' ? repeatDays : undefined,
      endType: 'forever',
    };
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const startDT = isAllDay ? startDate : `${startDate}T${startTime}`;
    const endDT = isAllDay ? endDate : `${endDate}T${endTime}`;
    const payload: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      calendarId,
      title: title.trim(),
      isAllDay,
      startDateTime: startDT,
      endDateTime: endDT,
      memo: memo || undefined,
      meetingContactId: meetingContactId || undefined,
      notifyMemberIds: notifyIds,
      repeat: buildRepeat(),
    };
    if (existing) {
      updateEvent(existing.id, payload);
    } else {
      addEvent(payload);
    }
    closeEventForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-white overflow-y-auto">
      <FormHeader
        title={existing ? '일정 수정' : '일정 등록'}
        onCancel={closeEventForm}
        onSave={handleSave}
        saveDisabled={!title.trim()}
      />

      <div className="p-4 space-y-6">
        {/* Calendar */}
        <div className="relative">
          <label className="text-xs text-gray-500 mb-1 block">캘린더</label>
          <button
            type="button"
            onClick={() => setShowCalDropdown(!showCalDropdown)}
            className="flex items-center gap-2 w-full"
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCal?.color }} />
            <span>{selectedCal?.name}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {showCalDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
              {writableCals.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCalendarId(c.id); setShowCalDropdown(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정명"
            className="w-full text-xl border-b-2 border-primary outline-none py-2"
          />
        </div>

        {/* Period */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
              <span className="text-sm">종일</span>
            </label>
            <button
              type="button"
              onClick={() => setShowRepeat(!showRepeat)}
              className={`text-sm px-3 py-1 rounded-full border ${
                showRepeat ? 'bg-primary text-white border-primary' : 'border-gray-300'
              }`}
            >
              반복
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
            {!isAllDay && (
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded px-2 py-1" />
            )}
            <span className="text-gray-400">→</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
            {!isAllDay && (
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border rounded px-2 py-1" />
            )}
          </div>

          {showRepeat && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(REPEAT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRepeatType(key)}
                    className={`px-2 py-1 text-xs rounded-full border ${
                      repeatType === key ? 'bg-primary text-white border-primary' : 'border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {(repeatType === 'custom' || repeatType === 'weekly') && (
                <div className="flex flex-wrap gap-1">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setRepeatDays((prev) =>
                          prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
                        )
                      }
                      className={`w-8 h-8 text-xs rounded-full border ${
                        repeatDays.includes(i) ? 'bg-primary text-white border-primary' : 'border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {repeatType === 'custom' && (
                <div className="flex items-center gap-2 text-sm">
                  <span>매</span>
                  <input
                    type="number"
                    min={1}
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1"
                  />
                  <span>주</span>
                </div>
              )}
              <button type="button" className="flex items-center gap-1 text-sm text-primary">
                <Plus size={14} /> 반복 조건 추가
              </button>
            </div>
          )}
        </div>

        {/* Meeting contact & notify */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">미팅처 & 알림</label>
          {selectedMc ? (
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{selectedMc.name}</span>
              <button type="button" onClick={() => { setMeetingContactId(''); setNotifyIds([]); }}>
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={mcSearch}
                onChange={(e) => { setMcSearch(e.target.value); setShowMcDropdown(true); }}
                onFocus={() => setShowMcDropdown(true)}
                placeholder="미팅처 검색"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              {showMcDropdown && mcSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {mcFiltered.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMcSelect(m.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {m.name} · {m.category}
                    </button>
                  ))}
                  {!mcFiltered.some((m) => m.name === mcSearch.trim()) && mcSearch.trim() && (
                    <button
                      type="button"
                      onClick={handleMcCreate}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-primary"
                    >
                      '{mcSearch.trim()}' 신규 등록
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {(selectedMc || notifyIds.length > 0) && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">알림 받을 사람</span>
                {selectedMc && (
                  <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">
                    {selectedMc.name} 디폴트
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {notifyIds.map((id) => {
                  const m = members.find((mem) => mem.id === id);
                  if (!m) return null;
                  return (
                    <MemberPill
                      key={id}
                      member={m}
                      small
                      onRemove={() => setNotifyIds((prev) => prev.filter((x) => x !== id))}
                    />
                  );
                })}
              </div>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="이름 검색으로 추가"
                className="w-full border rounded px-2 py-1 text-sm"
              />
              {memberFiltered.length > 0 && (
                <div className="mt-1 bg-white border rounded-lg max-h-32 overflow-y-auto">
                  {memberFiltered.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setNotifyIds((prev) => [...prev, m.id]); setMemberSearch(''); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-sm"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memo */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="메모 입력"
          />
        </div>
      </div>
    </div>
  );
}
