import { X } from 'lucide-react';
import type { Member } from '../../types';

interface MemberPillProps {
  member: Member;
  onRemove?: () => void;
  small?: boolean;
}

export function MemberPill({ member, onRemove, small }: MemberPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-white ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      style={{ backgroundColor: member.color }}
    >
      {member.name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
