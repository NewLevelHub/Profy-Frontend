import { cn } from '@/shared/lib/cn';
import { ADMIN_META } from '@/shared/ui/admin/density';
import { ReviewTextField } from './ReviewTextField';

// The psychologist cabinet has no i18n namespace (KZ-210) — Russian only.
const TRAIT_LABELS: Record<string, string> = {
  openness: 'Открытость новому',
  conscientiousness: 'Организованность',
  extraversion: 'Общительность',
  agreeableness: 'Доброжелательность',
  emotional_stability: 'Эмоциональная устойчивость',
};

interface ReviewPersonalityNotesEditorProps {
  notes: Record<string, string>;
  onChange: (notes: Record<string, string>) => void;
  disabled?: boolean;
}

/** One phrase per Big Five trait — keys are fixed, only the text is editable. */
export function ReviewPersonalityNotesEditor({ notes, onChange, disabled }: ReviewPersonalityNotesEditorProps) {
  const entries = Object.entries(notes);
  if (entries.length === 0) {
    return <p className={cn(ADMIN_META, 'm-0')}>Описаний нет</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([trait, text]) => (
        <ReviewTextField
          key={trait}
          label={TRAIT_LABELS[trait] ?? trait}
          value={text}
          onChange={(value) => onChange({ ...notes, [trait]: value })}
          disabled={disabled}
          rows={2}
        />
      ))}
    </div>
  );
}
