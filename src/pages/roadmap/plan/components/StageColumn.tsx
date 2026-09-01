import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import type { PlanStage } from '@/shared/types';
import { TaskBlock } from './TaskBlock';
import type { usePlanProgress } from '../hooks/usePlanProgress';

interface Props {
  stage: PlanStage;
  stageIdx: number;
  defaultOpen: boolean;
  progress: ReturnType<typeof usePlanProgress>;
}

function StageColumnImpl({ stage, stageIdx, defaultOpen, progress }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = progress.stagePct(stageIdx);

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-raised/40 transition-colors"
      >
        <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-brand-subtle text-brand text-body-sm font-bold">
          {stageIdx + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-primary">{stage.label}</span>
          <span className="block text-body-xs text-muted mt-0.5">{stage.outcome}</span>
        </span>
        <span className="text-mono-xs text-muted tabular-nums shrink-0">{pct}%</span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t border-default p-4 flex flex-col gap-3">
          <ProgressBar value={pct} />
          {stage.tasks.map((task, ti) => (
            <TaskBlock
              key={ti}
              task={task}
              stageIdx={stageIdx}
              taskIdx={ti}
              pct={progress.taskPct(stageIdx, ti)}
              isDone={progress.isDone}
              counterValue={progress.counterValue}
              onToggle={progress.onToggle}
              onBump={progress.onBump}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export const StageColumn = memo(StageColumnImpl);
