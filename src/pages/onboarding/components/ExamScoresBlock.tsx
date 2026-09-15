import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
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

export function ExamScoresBlock({
  examsTaken, onToggleExam,
  examScores, onScoreChange,
  errors,
}: ExamScoresBlockProps) {
  const { t } = useTranslation('onboarding');
  const revealed = CERTIFICATE_TYPES.filter(type => examsTaken.includes(type));

  return (
    <div className="flex flex-col gap-5 pt-1 border-t border-default">
      <div className="pt-5">
        <Heading level="display-md" as="h2" className="text-[color:var(--text-heading)]">
          {t('exams.heading')}
        </Heading>
        <Text variant="body-md" className="text-secondary mt-1.5">
          {t('exams.hint')}
        </Text>
      </div>

      <div className="panel-glass flex flex-col gap-3 !p-4 sm:!p-5">
        <p className="text-body-sm font-semibold text-[color:var(--text-heading)] m-0">
          {t('exams.pickLabel')}
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('exams.pickAria')}>
          {CERTIFICATE_TYPES.map(type => (
            <SelectableChip
              key={type}
              label={t(CERTIFICATE_LABELS[type])}
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
                label={t('exams.scoreLabel', { exam: t(CERTIFICATE_LABELS[type]) })}
                type="number"
                inputMode="decimal"
                value={examScores[type]}
                onChange={e => onScoreChange(type, e.target.value)}
                placeholder={t('exams.rangePlaceholder', { min: range.min, max: range.max })}
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
