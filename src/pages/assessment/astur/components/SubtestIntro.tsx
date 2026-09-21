import { useTranslation } from 'react-i18next';
import type { AsturContentSubtest } from '@/shared/types';
import { AssessmentIntro } from '../../components/AssessmentIntro';

interface SubtestIntroProps {
  subtest: AsturContentSubtest;
  index: number;
  count: number;
  onStart: () => void;
}

/** АСТУР per-subtest gate — thin wrapper around the shared AssessmentIntro card (PRO-396). */
export function SubtestIntro({ subtest, index, count, onStart }: SubtestIntroProps) {
  const { t } = useTranslation('assessment');

  const durationLabel =
    subtest.time_limit_sec !== null
      ? t('intro.durationExactMin', { count: Math.max(1, Math.round(subtest.time_limit_sec / 60)) })
      : undefined;

  return (
    <AssessmentIntro
      kicker={t('rail.subtestOf', { current: index + 1, total: count })}
      title={subtest.name}
      subtitle={subtest.instruction}
      itemCountLabel={t('intro.taskCount', { count: subtest.item_count })}
      durationLabel={durationLabel}
      ctaLabel={t('intro.astur.cta')}
      onStart={onStart}
    />
  );
}
