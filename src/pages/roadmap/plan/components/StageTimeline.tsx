import { SectionHeading } from '@/shared/ui/SectionHeading';
import type { PlanStage } from '@/shared/types';
import { StageColumn } from './StageColumn';
import type { usePlanProgress } from '../hooks/usePlanProgress';

interface Props {
  stages: PlanStage[];
  progress: ReturnType<typeof usePlanProgress>;
}

/** Vertical list — one card per stage. Not a fancy timeline, but the blocks
 *  are clearly separated and long task text has room to breathe. */
export function StageTimeline({ stages, progress }: Props) {
  return (
    <section id="plan-stages" className="flex flex-col gap-3">
      <SectionHeading title="Этапы" className="mb-0" />
      {stages.map((stage, si) => (
        <StageColumn
          key={stage.slot}
          stage={stage}
          stageIdx={si}
          defaultOpen={si === 0}
          progress={progress}
        />
      ))}
    </section>
  );
}
