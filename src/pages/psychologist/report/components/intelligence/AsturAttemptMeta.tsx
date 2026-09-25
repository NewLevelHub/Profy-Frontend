import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { IntelligenceSection } from '@/shared/types';

/** Which attempt this is (date, form/formula version, age/grade at the time),
 *  plus retake and protocol-quality notices. */
export function AsturAttemptMeta({ section }: { section: IntelligenceSection }) {
  const { t, i18n } = useTranslation('psychReport');
  const subtestNames = t('psychReport:astur.subtests', { returnObjects: true }) as Record<string, { name: string }>;
  const date = new Date(section.completed_at).toLocaleDateString(i18n.language);
  const warnings = section.protocol_quality.flags.filter((f) => f.code !== 'legacy_protocol');

  const ageParts = [
    section.age_at_completion !== null
      ? t('psychReport:astur.ageAtCompletion', { age: section.age_at_completion })
      : t('psychReport:astur.ageUnknown'),
    section.grade_at_completion !== null
      ? t('psychReport:astur.gradeAtCompletion', { grade: section.grade_at_completion })
      : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className={cn(ADMIN_TEXT, 'font-medium text-primary')}>{t('psychReport:astur.attempt', { date })}</span>
        <span className={ADMIN_META}>{ageParts.join(' · ')}</span>
        <span className={ADMIN_META}>
          {t('psychReport:astur.formVersion', { bank: section.bank_version, scoring: section.scoring_version })}
        </span>
        {section.legacy && <AdminBadge tone="neutral">{t('psychReport:astur.legacyBadge')}</AdminBadge>}
      </div>

      {section.legacy && <p className={cn(ADMIN_META, 'm-0')}>{t('psychReport:astur.legacyNote')}</p>}

      {section.retake_in_progress && (
        <div className="flex items-start gap-2.5 p-3 rounded-[14px] border border-default bg-hover">
          <Info size={15} className="text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{t('psychReport:astur.retakeInProgress')}</p>
        </div>
      )}

      {!section.protocol_quality.ok && warnings.length > 0 && (
        <div role="alert" className="flex items-start gap-2.5 p-3 rounded-[14px] border border-warning bg-warning-subtle">
          <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{t('psychReport:astur.protocol.title')}</p>
            <ul className="m-0 pl-4 flex flex-col gap-0.5">
              {warnings.map((flag, i) => (
                <li key={`${flag.code}-${flag.subtest ?? i}`} className={cn(ADMIN_TEXT, 'text-secondary')}>
                  {t(`psychReport:astur.protocol.flags.${flag.code}`, {
                    subtest: flag.subtest ? subtestNames[flag.subtest]?.name ?? flag.subtest : '',
                    count: flag.count ?? 0,
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
