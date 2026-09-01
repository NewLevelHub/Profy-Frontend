import { memo } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import type { PlanAction, PlanTask } from '@/shared/types';
import { TRACK_META } from './trackMeta';
import { ActionRow } from './ActionRow';

interface Props {
  task: PlanTask;
  stageIdx: number;
  taskIdx: number;
  pct: number;
  isDone: (si: number, ti: number, sti: number, ai: number, action: PlanAction) => boolean;
  counterValue: (si: number, ti: number, sti: number, ai: number) => number;
  onToggle: (si: number, ti: number, sti: number, ai: number) => void;
  onBump: (si: number, ti: number, sti: number, ai: number, max: number) => void;
}

function TaskBlockImpl({ task, stageIdx, taskIdx, pct, isDone, counterValue, onToggle, onBump }: Props) {
  const meta = TRACK_META[task.track];
  return (
    <div className="rounded-[var(--radius)] border border-default bg-raised/30 p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-body-sm font-semibold text-primary leading-snug">{task.title}</h4>
        <Badge variant={meta.badge}>{meta.label}</Badge>
      </div>
      <p className="text-body-xs text-secondary">{task.why}</p>

      {task.steps.map((step, sti) => (
        <div key={sti} className="mt-1">
          {step.title && (
            <p className="text-body-xs font-semibold text-muted uppercase tracking-wide mb-1">
              {step.title}
            </p>
          )}
          <ul className="flex flex-col divide-y divide-default/60">
            {step.actions.map((action, ai) => (
              <ActionRow
                key={ai}
                action={action}
                done={isDone(stageIdx, taskIdx, sti, ai, action)}
                counter={counterValue(stageIdx, taskIdx, sti, ai)}
                onToggle={() => onToggle(stageIdx, taskIdx, sti, ai)}
                onBump={() => onBump(stageIdx, taskIdx, sti, ai, action.count_target ?? 0)}
              />
            ))}
          </ul>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-mono-xs text-muted tabular-nums">{pct}%</span>
      </div>
      <p className="text-body-xs text-muted">
        <span className="font-semibold">Готово, когда:</span> {task.done_when}
      </p>
    </div>
  );
}

export const TaskBlock = memo(TaskBlockImpl);
