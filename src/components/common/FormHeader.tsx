interface FormHeaderProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
}

export function FormHeader({
  title,
  onCancel,
  onSave,
  saveLabel = '저장',
  saveDisabled,
}: FormHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-primary text-white">
      <button type="button" onClick={onCancel} className="text-sm">
        취소
      </button>
      <span className="font-medium">{title}</span>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className="text-sm font-medium disabled:opacity-50"
      >
        {saveLabel}
      </button>
    </header>
  );
}
