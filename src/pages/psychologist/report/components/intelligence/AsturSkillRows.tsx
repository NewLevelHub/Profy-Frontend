import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AsturSubtestResult } from '@/shared/types';
import { LineChart, type LineChartPoint } from '../LineChart';
import { PsychDetailCard } from '../PsychDetailCard';
import { ScoreRow } from '../ScoreRow';
import { getAsturSubtests } from '../../model/psychTestExplanations';

interface AsturSkillRowsProps {
  subtests: AsturSubtestResult[];
  overallPercent: number | null;
}

/** Per-skill percent profile (chart) + one row per skill with `score/max`
 *  and percent, and the equal-weight overall percent. */
export function AsturSkillRows({ subtests, overallPercent }: AsturSkillRowsProps) {
  const { t } = useTranslation('psychReport');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const skills = getAsturSubtests(t);
  const shortLabels = t('psychReport:astur.subtestShortLabels', { returnObjects: true }) as Record<string, string>;

  const points: LineChartPoint[] = subtests.map((s) => ({
    key: s.key,
    label: shortLabels[s.key] ?? s.key,
    value: s.score,
    max: s.max_score,
  }));

  return (
    <div className="flex flex-col items-center gap-3 mb-4">
      {points.length > 0 && <LineChart points={points} />}

      <div className="flex flex-col gap-1.5 w-full">
        {subtests.map((s) => {
          const info = skills[s.key];
          const isOpen = openKey === s.key;
          return (
            <ScoreRow
              key={s.key}
              label={
                <span className={cn(ADMIN_TEXT, isOpen && 'text-primary font-medium')}>{info?.name ?? s.key}</span>
              }
              value={
                <span className={ADMIN_NUM}>
                  {s.score}/{s.max_score} · {s.percent}%
                </span>
              }
              isOpen={isOpen}
              onToggle={() => setOpenKey((current) => (current === s.key ? null : s.key))}
            >
              {info && (
                <PsychDetailCard
                  bare
                  title={info.name}
                  badge={<AdminBadge tone="brand">{t('psychReport:astur.subtestBadge')}</AdminBadge>}
                  meaning={info.meaning}
                  means={info.behavioralManifestation}
                  follows={info.psychologistFocus}
                  why={[
                    t('psychReport:astur.subtestWhy', {
                      score: s.score,
                      max: s.max_score,
                      percent: s.percent,
                      scoring: info.normsExplanation ?? '',
                    }),
                    s.skipped ? t('psychReport:astur.skippedNote', { skipped: s.skipped }) : '',
                    s.unanswered ? t('psychReport:astur.unansweredNote', { unanswered: s.unanswered }) : '',
                    s.in_overall ? '' : t('psychReport:astur.notInOverall'),
                  ].filter(Boolean).join(' ')}
                />
              )}
            </ScoreRow>
          );
        })}
      </div>

      {/* Secondary to the per-skill profile above: an equal-weight mean of
          the blocks, never a single ability level. */}
      {overallPercent !== null && (
        <div className="flex flex-col items-center gap-0.5 text-center pt-1">
          <span className={cn(ADMIN_TEXT, 'text-secondary')}>
            {t('psychReport:astur.overall', { percent: overallPercent })}
          </span>
          <span className={ADMIN_META}>{t('psychReport:astur.overallNote')}</span>
        </div>
      )}
    </div>
  );
}
