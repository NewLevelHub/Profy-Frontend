import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Mono, Text } from '@/shared/ui/typography';
import { REVIEW_LINE_INPUT } from './reviewFieldStyles';

/** Big Five T-scores sit around 50; outside 40–60 a phrase leans on a
 *  pronounced trait and deserves a second look before the student reads it. */
const CORRIDOR_LOW = 40;
const CORRIDOR_HIGH = 60;

/** personality_notes key → big_five scale code. Emotional stability is the
 *  inverse of N, but the corridor is symmetric, so the raw N works as is. */
const TRAIT_SCALE: Record<string, string> = {
  openness: 'O',
  conscientiousness: 'C',
  extraversion: 'E',
  agreeableness: 'A',
  emotional_stability: 'N',
};

function isOutsideCorridor(bigFive: Record<string, number>, trait: string): boolean {
  const score = bigFive[TRAIT_SCALE[trait] ?? ''];
  return typeof score === 'number' && (score < CORRIDOR_LOW || score > CORRIDOR_HIGH);
}

interface ReviewPersonalityNotesEditorProps {
  notes: Record<string, string>;
  bigFive: Record<string, number>;
  onChange: (notes: Record<string, string>) => void;
  disabled?: boolean;
}

/** One phrase per Big Five trait — keys are fixed, only the text is editable. */
export function ReviewPersonalityNotesEditor({ notes, bigFive, onChange, disabled }: ReviewPersonalityNotesEditorProps) {
  const { t } = useTranslation(['psychologist', 'results']);
  const entries = Object.entries(notes);
  if (entries.length === 0) {
    return (
      <Text variant="body-sm" className="text-muted m-0">
        {t('review.traits.empty')}
      </Text>
    );
  }

  return (
    <ul className="flex flex-col m-0 p-0 list-none">
      {entries.map(([trait, text]) => {
        const flagged = isOutsideCorridor(bigFive, trait);
        const label = t(`results:personality.${trait}`, { defaultValue: trait });
        return (
          <li
            key={trait}
            className="flex flex-wrap items-center gap-x-5 gap-y-1 py-2 border-b border-dotted border-strong last:border-b-0"
          >
            <Mono
              variant="sm"
              className={cn('basis-44 flex-none', flagged ? 'text-[color:var(--dawn-deep)]' : 'text-muted')}
            >
              {label}
              {flagged && <span className="sr-only"> — {t('review.traits.outsideCorridor')}</span>}
            </Mono>
            <input
              value={text}
              onChange={(e) => onChange({ ...notes, [trait]: e.target.value })}
              disabled={disabled}
              aria-label={label}
              className={cn(REVIEW_LINE_INPUT, 'flex-1 basis-72 border-b-transparent hover:border-b-[color:var(--line)]')}
            />
          </li>
        );
      })}
    </ul>
  );
}
