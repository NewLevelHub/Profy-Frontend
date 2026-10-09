import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/i18n/format';
import { cn } from '@/shared/lib/cn';
import type { PsychEmotionalSection } from '@/shared/types';
import { PsychoEmotionalReport } from '@/shared/ui';
import { PsychSectionShell } from './PsychSectionShell';

interface PsychoEmotionalSectionProps {
  section?: PsychEmotionalSection | null;
}

const VALIDITY_DOT = {
  ok: 'bg-success',
  caution: 'bg-warning',
  low: 'bg-danger',
} as const;

/**
 * Specialist-only psychoemotional report. The shared report body keeps this
 * result surface and the psychologist cabinet in the same reading order:
 * interpretation, scales, then the calculation protocol.
 */
export function PsychoEmotionalSection({ section }: PsychoEmotionalSectionProps) {
  const { t } = useTranslation('psychologist');
  if (!section) return null;

  const completed = new Date(section.completed_at);
  const completedLabel = Number.isNaN(completed.getTime()) ? '' : formatDate(completed, { dateStyle: 'short' });

  return (
    <PsychSectionShell title={t('psycho.title')}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-body font-semibold leading-snug text-primary">
            {t('psycho.run', { n: section.run_number })}
            {completedLabel && <span className="font-normal text-secondary"> · {completedLabel}</span>}
          </p>
          {section.validity_flag && (
            <span className="flex items-center gap-1.5 text-caption text-secondary">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', VALIDITY_DOT[section.validity_flag])} aria-hidden />
              {t('psychoResult.validityLabel', { label: t(`psychoResult.validity.${section.validity_flag}`) })}
            </span>
          )}
        </div>

        {section.validity_reasons.length > 0 && (
          <ul className="flex flex-col gap-1 text-caption text-secondary">
            {section.validity_reasons.map((code) => (
              <li key={code}>• {t(`psycho.reason.${code}`, { defaultValue: code })}</li>
            ))}
          </ul>
        )}

        <PsychoEmotionalReport section={section} />
      </div>
    </PsychSectionShell>
  );
}
