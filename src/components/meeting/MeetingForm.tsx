import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FormHeader } from '../common/FormHeader';
import { MemberPill } from '../common/MemberPill';

const CATEGORIES = ['고객사', '파트너', '공급사'];

export function MeetingForm() {
  const isOpen = useAppStore((s) => s.isMeetingFormOpen);
  const editingId = useAppStore((s) => s.editingMeetingId);
  const closeMeetingForm = useAppStore((s) => s.closeMeetingForm);
  const addMeetingContact = useAppStore((s) => s.addMeetingContact);
  const updateMeetingContact = useAppStore((s) => s.updateMeetingContact);
  const meetingContacts = useAppStore((s) => s.meetingContacts);
  const members = useAppStore((s) => s.members);

  const existing = editingId ? meetingContacts.find((m) => m.id === editingId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? '고객사');
  const [managerName, setManagerName] = useState(existing?.managerName ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [memo, setMemo] = useState(existing?.memo ?? '');
  const [notifyIds, setNotifyIds] = useState<string[]>(existing?.defaultNotifyIds ?? []);
  const [memberSearch, setMemberSearch] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      category,
      managerName: managerName.trim(),
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      memo: memo || undefined,
      defaultNotifyIds: notifyIds,
    };
    if (existing) {
      updateMeetingContact(existing.id, payload);
    } else {
      addMeetingContact(payload);
    }
    closeMeetingForm();
  };

  if (!isOpen) return null;

  const filteredMembers = memberSearch.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
          !notifyIds.includes(m.id)
      )
    : [];

  return (
    <div className="fixed inset-0 z-[90] bg-white overflow-y-auto">
      <FormHeader
        title={existing ? '미팅처 수정' : '미팅처 등록'}
        onCancel={closeMeetingForm}
        onSave={handleSave}
        saveDisabled={!name.trim()}
      />

      <div className="p-4 space-y-4">
        <Field label="회사/단체명">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b py-2 outline-none"
          />
        </Field>

        <Field label="카테고리">
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  category === c ? 'bg-primary text-white border-primary' : 'border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="담당자 이름">
          <input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="w-full border-b py-2 outline-none"
          />
        </Field>

        <Field label="연락처">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-b py-2 outline-none"
          />
        </Field>

        <Field label="이메일">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b py-2 outline-none"
          />
        </Field>

        <Field label="주소">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border-b py-2 outline-none"
          />
        </Field>

        <Field label="메모">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
        </Field>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-primary mb-1">알림 받을 사람 (디폴트)</p>
          <p className="text-xs text-gray-500 mb-3">
            이 거래처 일정 등록 시 자동으로 알림에 포함됩니다
          </p>
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
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="이름 검색으로 추가"
            className="w-full border rounded px-2 py-1 text-sm"
          />
          {filteredMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setNotifyIds((prev) => [...prev, m.id]); setMemberSearch(''); }}
              className="w-full text-left px-3 py-1.5 hover:bg-white rounded text-sm"
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
