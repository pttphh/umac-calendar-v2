import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FormHeader } from '../common/FormHeader';
import { MemberPill } from '../common/MemberPill';

const COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9c27b0', '#00bcd4', '#ff5722'];

export function CalendarForm() {
  const isOpen = useAppStore((s) => s.isCalendarFormOpen);
  const editingId = useAppStore((s) => s.editingCalendarId);
  const closeCalendarForm = useAppStore((s) => s.closeCalendarForm);
  const addCalendar = useAppStore((s) => s.addCalendar);
  const updateCalendar = useAppStore((s) => s.updateCalendar);
  const calendars = useAppStore((s) => s.calendars);
  const members = useAppStore((s) => s.members);

  const existing = editingId ? calendars.find((c) => c.id === editingId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const [writerIds, setWriterIds] = useState<string[]>(existing?.writerIds ?? []);
  const [viewerIds, setViewerIds] = useState<string[]>(existing?.viewerIds ?? []);
  const [showWriterAdd, setShowWriterAdd] = useState(false);
  const [showViewerAdd, setShowViewerAdd] = useState(false);

  const handleSave = () => {
    if (!name.trim() || writerIds.length === 0) return;
    const payload = {
      name: name.trim(),
      color,
      isVisible: true,
      writerIds,
      viewerIds,
    };
    if (existing) {
      updateCalendar(existing.id, payload);
    } else {
      addCalendar(payload);
    }
    closeCalendarForm();
  };

  if (!isOpen) return null;

  const availableWriters = members.filter((m) => !writerIds.includes(m.id));
  const availableViewers = members.filter((m) => !viewerIds.includes(m.id));

  return (
    <div className="fixed inset-0 z-[90] bg-white overflow-y-auto">
      <FormHeader
        title={existing ? '캘린더 수정' : '캘린더 만들기'}
        onCancel={closeCalendarForm}
        onSave={handleSave}
        saveDisabled={!name.trim() || writerIds.length === 0}
      />

      <div className="p-4 space-y-6">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">캘린더 이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b-2 border-primary py-2 outline-none text-lg"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">색상 선택</label>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <MemberSection
          title="작성자"
          subtitle="일정 추가·수정·삭제 가능"
          ids={writerIds}
          members={members}
          onRemove={(id) => setWriterIds((prev) => prev.filter((x) => x !== id))}
          showAdd={showWriterAdd}
          onToggleAdd={() => setShowWriterAdd(!showWriterAdd)}
          available={availableWriters}
          onAdd={(id) => { setWriterIds((prev) => [...prev, id]); setShowWriterAdd(false); }}
        />

        <MemberSection
          title="공유자"
          subtitle="보기만 가능"
          ids={viewerIds}
          members={members}
          onRemove={(id) => setViewerIds((prev) => prev.filter((x) => x !== id))}
          showAdd={showViewerAdd}
          onToggleAdd={() => setShowViewerAdd(!showViewerAdd)}
          available={availableViewers}
          onAdd={(id) => { setViewerIds((prev) => [...prev, id]); setShowViewerAdd(false); }}
        />

        <p className="text-xs text-gray-400">
          작성자·공유자는 알림과 무관합니다. 알림은 일정 등록 시 별도 설정합니다.
        </p>

        {!editingId && calendars.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">기존 캘린더</p>
            {calendars.map((cal) => (
              <button
                key={cal.id}
                type="button"
                onClick={() => {
                  setName(cal.name);
                  setColor(cal.color);
                  setWriterIds(cal.writerIds);
                  setViewerIds(cal.viewerIds);
                  useAppStore.getState().openCalendarForm(cal.id);
                }}
                className="flex items-center gap-2 w-full py-2 text-sm"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cal.color }} />
                {cal.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberSection({
  title,
  subtitle,
  ids,
  members,
  onRemove,
  showAdd,
  onToggleAdd,
  available,
  onAdd,
}: {
  title: string;
  subtitle: string;
  ids: string[];
  members: { id: string; name: string; color: string }[];
  onRemove: (id: string) => void;
  showAdd: boolean;
  onToggleAdd: () => void;
  available: { id: string; name: string; color: string }[];
  onAdd: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {ids.map((id) => {
          const m = members.find((mem) => mem.id === id);
          if (!m) return null;
          return <MemberPill key={id} member={m} small onRemove={() => onRemove(id)} />;
        })}
      </div>
      <button
        type="button"
        onClick={onToggleAdd}
        className="flex items-center gap-1 text-sm text-primary"
      >
        <Plus size={14} /> {title} 추가
      </button>
      {showAdd && (
        <div className="mt-2 border rounded-lg">
          {available.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onAdd(m.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
