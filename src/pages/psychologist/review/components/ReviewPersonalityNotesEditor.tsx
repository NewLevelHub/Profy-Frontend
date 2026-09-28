import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { ADMIN_META } from '@/shared/ui/admin/density';
import { ReviewTextField } from './ReviewTextField';

// Big Five trait → the wording the student sees in "Твой характер".
const TRAIT_KEYS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability'];

interface ReviewPersonalityNotesEditorProps {
  notes: Record<string, string>;
  onChange: (notes: Record<string, string>) => void;
  disabled?: boolean;
}

/** One phrase per Big Five trait — keys are fixed, only the text is editable. */
export function ReviewPersonalityNotesEditor({ notes, onChange, disabled }: ReviewPersonalityNotesEditorProps) {
  const { t } = useTranslation('psychologist');
  const entries = Object.entries(notes);
  if (entries.length === 0) {
    return <p className={cn(ADMIN_META, 'm-0')}>{t('reportEditor.traits.none')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([trait, text]) => (
        <ReviewTextField
          key={trait}
          label={TRAIT_KEYS.includes(trait) ? t(`reportEditor.traits.${trait}`) : trait}
          value={text}
          onChange={(value) => onChange({ ...notes, [trait]: value })}
          disabled={disabled}
          rows={2}
        />
      ))}
    </div>
  );
}
