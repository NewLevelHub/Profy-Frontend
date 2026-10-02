/** "+ своё" pill that turns into an inline input — the student's own chip
 *  value next to the presets (subjects, hobbies, professions, …).
 */
import { useState } from 'react';

// Mirrors the backend's ARTIFACT_VALUE_MAX_LENGTH / SUBJECT_MAX_LENGTH: a chip
// is a short label. Without a cap a pasted wall of text became one giant pill
// that swallowed the whole group.
const CUSTOM_CHIP_MAX_LENGTH = 60;

export interface AddCustomChipProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}

export function AddCustomChip({ label, placeholder, onAdd }: AddCustomChipProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  function commit() {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue('');
    setOpen(false);
  }

  if (open) {
    return (
      <input
        autoFocus
        value={value}
        maxLength={CUSTOM_CHIP_MAX_LENGTH}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { setValue(''); setOpen(false); }
        }}
        placeholder={placeholder}
        className="field-tile px-3.5 py-2 rounded-pill text-caption font-semibold w-36 focus:outline-none border-[color:var(--pine)]"
        style={{ color: 'var(--text-heading)' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="px-3.5 py-2 rounded-pill text-caption font-semibold transition-colors press-scale"
      style={{
        background: 'transparent',
        color: 'var(--mute)',
        border: '1.5px dashed color-mix(in srgb, var(--pine) 28%, var(--hairline))',
      }}
    >
      {label}
    </button>
  );
}
