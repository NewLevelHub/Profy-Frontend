import type { GpaScale } from '@/shared/types';
import { GPA_SCALES, GPA_SCALE_LABELS } from '../utils/certificateConfig';

export interface GpaScaleSelectorProps {
  value: GpaScale | null;
  onChange: (scale: GpaScale) => void;
}

// Same button-row pattern as the age picker (ProfileSetupPage) — a small,
// fixed set of options reads better as direct buttons than a native
// <select>, which nothing else in this app uses either.
export function GpaScaleSelector({ value, onChange }: GpaScaleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Система оценки GPA">
      {GPA_SCALES.map(scale => {
        const selected = value === scale;
        return (
          <button
            key={scale}
            type="button"
            onClick={() => onChange(scale)}
            aria-pressed={selected}
            className="px-4 h-11 rounded-full text-label font-semibold transition-colors"
            style={{
              background: selected ? 'var(--pine)' : 'var(--bg-surface)',
              color: selected ? 'var(--text-on-brand)' : 'var(--ink)',
              border: selected ? '1.5px solid var(--pine)' : '1.5px solid var(--line)',
            }}
          >
            {GPA_SCALE_LABELS[scale]}
          </button>
        );
      })}
    </div>
  );
}
