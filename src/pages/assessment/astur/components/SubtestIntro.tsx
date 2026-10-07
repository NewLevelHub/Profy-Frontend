import { useTranslation } from 'react-i18next';
import type { AsturContentSubtest } from '@/shared/types';
import { AssessmentIntro } from '../../components/AssessmentIntro';

interface SubtestIntroProps {
  subtest: AsturContentSubtest;
  index: number;
  count: number;
  /** Lability has no subtest limit, only a cap per command. */
  labilityItemLimitMs: number;
  starting: boolean;
  onStart: () => void;
}

/** АСТУР per-subtest gate — thin wrapper around the shared AssessmentIntro card (PRO-396). */
export function SubtestIntro({ subtest, index, count, labilityItemLimitMs, starting, onStart }: SubtestIntroProps) {
  const { t } = useTranslation('assessment');

  const limitMinutes = subtest.time_limit_sec !== null ? Math.max(1, Math.round(subtest.time_limit_sec / 60)) : null;
  const durationLabel = limitMinutes !== null ? t('intro.durationExactMin', { count: limitMinutes }) : undefined;
  // PRO-440: the student learns the timer is running before it starts, not
  // after — the clock row alone read like the "~2 мин" estimates elsewhere.
  const notice =
    limitMinutes !== null
      ? t('astur.subtest.timeLimitNotice', { count: limitMinutes })
      : subtest.key === 'lability'
        ? t('astur.subtest.labilityLimitNotice', { count: Math.round(labilityItemLimitMs / 1000) })
        : undefined;

  return (
    <AssessmentIntro
      kicker={t('rail.subtestOf', { current: index + 1, total: count })}
      title={subtest.name}
      subtitle={subtest.instruction}
      itemCountLabel={t('intro.taskCount', { count: subtest.item_count })}
      durationLabel={durationLabel}
      notice={notice}
      ctaLabel={t('intro.astur.cta')}
      onStart={onStart}
      isStarting={starting}
    />
  );
}
