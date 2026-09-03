import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { MONO_LABEL } from '@/shared/ui/admin/density';

interface StringListEditorProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

/** Editable chip list for string[] fields (aliases, exams, notes) — Enter to add, × to remove. */
export function StringListEditor({ label, values, onChange, placeholder }: StringListEditorProps) {
  const [draft, setDraft] = useState('');

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  }

  return (
    <div>
      <p className={cn(MONO_LABEL, 'text-muted mb-1.5')}>{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-[3px] font-semibold text-mono-sm bg-brand-subtle text-brand"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="hover:opacity-70"
              aria-label={`Убрать «${value}»`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? 'Добавить и Enter'}
          className={cn(
            MONO_LABEL,
            'rounded-[3px] border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal w-full max-w-[240px]',
          )}
        />
        <button
          type="button"
          onClick={add}
          className={cn(MONO_LABEL, 'px-2 py-1 rounded-[3px] border border-default text-secondary hover:border-strong transition-colors')}
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
