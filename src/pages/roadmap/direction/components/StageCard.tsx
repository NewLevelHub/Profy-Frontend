import { memo, useMemo } from 'react';
import { Badge } from '@/shared/ui/Badge';
import {
  DIRECTION_HORIZON_HINTS,
  DIRECTION_HORIZON_LABELS,
} from '@/shared/config/constants';
import type { DirectionStage } from '@/shared/types';
import { StepItem } from './StepItem';

interface StageCardProps {
  stage: DirectionStage;
  isLast: boolean;
}

export const StageCard = memo(function StageCard({ stage, isLast }: StageCardProps) {
  const steps = useMemo(
    () => [...stage.steps].sort((a, b) => a.priority - b.priority),
    [stage.steps],
  );

  return (
    <li className="relative pl-6 sm:pl-8">
      {/* Timeline rail */}
      <span
        className="absolute left-[7px] top-3 w-2.5 h-2.5 rounded-full bg-brand"
        aria-hidden="true"
      />
      {!isLast && (
        <span
          className="absolute left-[11px] top-6 bottom-0 w-px bg-[var(--border)]"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col gap-4 pb-10">
        <header className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">
              {DIRECTION_HORIZON_LABELS[stage.horizon] ?? stage.horizon}
            </Badge>
            <span className="text-caption text-muted">
              {DIRECTION_HORIZON_HINTS[stage.horizon] ?? ''}
            </span>
          </div>
          <h3 className="text-title font-extrabold text-primary leading-snug">{stage.title}</h3>
        </header>

        {stage.outcome && (
          <div className="rounded-[var(--radius)] bg-raised border border-default p-4 flex items-start gap-3">
            <span className="text-lg select-none" aria-hidden="true">🏆</span>
            <div className="flex flex-col gap-1">
              <p className="text-caption font-semibold text-muted uppercase tracking-wide">
                Что у тебя будет к концу этапа
              </p>
              <p className="text-body text-primary leading-relaxed">{stage.outcome}</p>
            </div>
          </div>
        )}

        {/* One ordered list of steps — how many are profile vs growth is up to the plan. */}
        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <StepItem key={`${step.text}-${i}`} step={step} index={i} />
          ))}
        </ol>

        {stage.integration_project && (
          <div className="rounded-[var(--radius)] border border-strong bg-surface p-4 flex items-start gap-3 shadow-card">
            <span className="text-xl select-none" aria-hidden="true">🔗</span>
            <div className="flex flex-col gap-1">
              <p className="text-label font-bold text-primary">
                Проект, где всё сходится вместе
              </p>
              <p className="text-body text-secondary leading-relaxed">
                {stage.integration_project}
              </p>
            </div>
          </div>
        )}
      </div>
    </li>
  );
});
