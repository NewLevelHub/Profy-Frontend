import { Input } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_LABELS,
  CERTIFICATE_SCORE_RANGES,
} from '@/shared/config/certificates';
import type { CertificateType } from '@/shared/types';
import { SelectableChip } from './SelectableChip';

export interface ExamScoresBlockProps {
  examsTaken: CertificateType[];
  onToggleExam: (type: CertificateType) => void;
  examScores: Record<CertificateType, string>;
  onScoreChange: (type: CertificateType, value: string) => void;
  errors: Partial<Record<CertificateType, string>>;
}

// Step 2's third block. Two-stage on purpose — tick the exams you sat, then
// fill in only those scores — rather than Profile's certificates editor,
// which shows all four inputs at once: a student is here to finish
// onboarding, so four number fields most of them will leave blank is four
// fields of friction. The chip also carries the meaning a blank input can't
// ("I sat this, the score is coming") which is what makes an empty score
// validatable instead of silently dropped.
export function ExamScoresBlock({
  examsTaken, onToggleExam,
  examScores, onScoreChange,
  errors,
}: ExamScoresBlockProps) {
  // Catalog order, not click order, so the revealed inputs don't reshuffle
  // as chips get ticked.
  const revealed = CERTIFICATE_TYPES.filter(type => examsTaken.includes(type));

  return (
    <div className="flex flex-col gap-6 pt-2 border-t border-default">
      <div className="pt-2">
        <Heading level="display-md" as="h2">
          Сдавал экзамены?
        </Heading>
        <p className="text-body mt-1" style={{ color: 'var(--ink)' }}>
          Необязательно — пригодится позже, когда будем собирать твой roadmap
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-label font-semibold" style={{ color: 'var(--midnight)' }}>
          Отметь, что уже сдавал
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Сданные экзамены">
          {CERTIFICATE_TYPES.map(type => (
            <SelectableChip
              key={type}
              label={CERTIFICATE_LABELS[type]}
              selected={examsTaken.includes(type)}
              onClick={() => onToggleExam(type)}
            />
          ))}
        </div>
      </div>

      {revealed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {revealed.map(type => {
            const range = CERTIFICATE_SCORE_RANGES[type];
            return (
              <Input
                key={type}
                label={`${CERTIFICATE_LABELS[type]} — балл`}
                type="number"
                inputMode="decimal"
                value={examScores[type]}
                onChange={e => onScoreChange(type, e.target.value)}
                placeholder={`от ${range.min} до ${range.max}`}
                min={range.min}
                max={range.max}
                step={range.step}
                error={errors[type]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
