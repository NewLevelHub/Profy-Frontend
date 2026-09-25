import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturMathReasoning, AsturSubjectProfile } from '@/shared/types';

interface AsturKnowledgeProfileProps {
  profile: AsturSubjectProfile;
  math: AsturMathReasoning | null;
}

/** Subject-area knowledge (not ability) with the leading / mixed /
 *  insufficient-data verdict, and number-series reasoning shown next to it. */
export function AsturKnowledgeProfile({ profile, math }: AsturKnowledgeProfileProps) {
  const { t } = useTranslation('psychReport');
  const subjects = t('psychReport:astur.subjects', { returnObjects: true }) as Record<string, string>;
  const name = (key: string | null) => (key ? subjects[key] ?? key : '');

  const verdict =
    profile.status === 'leading'
      ? t('psychReport:astur.profile.leading', {
          area: name(profile.leading),
          runnerUp: name(profile.runner_up),
          gap: profile.gap_pp,
          threshold: profile.threshold_pp,
        })
      : profile.status === 'mixed'
        ? t('psychReport:astur.profile.mixed', { gap: profile.gap_pp, threshold: profile.threshold_pp })
        : t('psychReport:astur.profile.insufficient');

  const mathNote =
    math && math.divergence && math.physics_math_knowledge_percent !== null
      ? t(
          math.divergence === 'knowledge_higher'
            ? 'psychReport:astur.math.knowledgeHigher'
            : math.divergence === 'reasoning_higher'
              ? 'psychReport:astur.math.reasoningHigher'
              : 'psychReport:astur.math.aligned',
          {
            knowledge: math.physics_math_knowledge_percent,
            reasoning: math.numeric_series_percent,
            threshold: math.threshold_pp,
          },
        )
      : null;

  return (
    <div className="pt-3 border-t border-default mb-4 flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <p className={cn(ADMIN_TEXT, 'font-medium text-primary m-0')}>{t('psychReport:astur.profile.title')}</p>
        <p className={cn(ADMIN_META, 'm-0')}>{t('psychReport:astur.profile.note')}</p>
      </div>
      <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{verdict}</p>

      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
        {profile.areas.map((area) => (
          <li key={area.key} className="flex items-center gap-2">
            <span className={cn(ADMIN_META, 'w-44 flex-shrink-0')}>{name(area.key)}</span>
            <ProgressBar value={area.percent} className="flex-1" />
            <span className={cn(ADMIN_NUM, 'w-24 text-right')}>
              {area.percent}% · {t('psychReport:astur.profile.areaValue', { earned: area.earned, count: area.item_count })}
            </span>
          </li>
        ))}
      </ul>

      {math && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn(ADMIN_META, 'w-44 flex-shrink-0')}>{t('psychReport:astur.math.title')}</span>
            <ProgressBar value={math.numeric_series_percent} variant="accent" className="flex-1" />
            <span className={cn(ADMIN_NUM, 'w-24 text-right')}>{math.numeric_series_percent}%</span>
          </div>
          {mathNote && <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{mathNote}</p>}
        </div>
      )}
    </div>
  );
}
