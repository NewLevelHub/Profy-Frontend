import { useCallback, useMemo } from 'react';
import { usePlanProgressStore } from '@/shared/store/planProgress';
import type { PlanAction, PlanStage } from '@/shared/types';

export function actionKey(
  planId: string, si: number, ti: number, sti: number, ai: number,
): string {
  return `${planId}:${si}.${ti}.${sti}.${ai}`;
}

interface Ref { si: number; ti: number; sti: number; ai: number; action: PlanAction }

function collect(stages: PlanStage[]): Ref[][] {
  return stages.map((stage, si) =>
    stage.tasks.flatMap((task, ti) =>
      task.steps.flatMap((step, sti) =>
        step.actions.map((action, ai) => ({ si, ti, sti, ai, action })),
      ),
    ),
  );
}

/** Progress + derived percentages for one plan. */
export function usePlanProgress(planId: string, stages: PlanStage[]) {
  const checked = usePlanProgressStore(s => s.checked);
  const counters = usePlanProgressStore(s => s.counters);
  const toggle = usePlanProgressStore(s => s.toggle);
  const bump = usePlanProgressStore(s => s.bump);

  const perStageRefs = useMemo(() => collect(stages), [stages]);

  const isDone = useCallback(
    (si: number, ti: number, sti: number, ai: number, action: PlanAction) => {
      const key = actionKey(planId, si, ti, sti, ai);
      if (action.kind === 'repeat' && action.count_target) {
        return (counters[key] ?? 0) >= action.count_target;
      }
      return Boolean(checked[key]);
    },
    [planId, checked, counters],
  );

  const counterValue = useCallback(
    (si: number, ti: number, sti: number, ai: number) =>
      counters[actionKey(planId, si, ti, sti, ai)] ?? 0,
    [planId, counters],
  );

  const pct = useCallback(
    (refs: Ref[]) => {
      if (refs.length === 0) return 0;
      const done = refs.filter(r => isDone(r.si, r.ti, r.sti, r.ai, r.action)).length;
      return Math.round((done / refs.length) * 100);
    },
    [isDone],
  );

  const stagePct = useCallback(
    (si: number) => pct(perStageRefs[si] ?? []),
    [pct, perStageRefs],
  );

  const taskPct = useCallback(
    (si: number, ti: number) =>
      pct((perStageRefs[si] ?? []).filter(r => r.ti === ti)),
    [pct, perStageRefs],
  );

  const overallPct = useMemo(
    () => pct(perStageRefs.flat()),
    [pct, perStageRefs],
  );

  return {
    isDone,
    counterValue,
    stagePct,
    taskPct,
    overallPct,
    onToggle: (si: number, ti: number, sti: number, ai: number) =>
      toggle(actionKey(planId, si, ti, sti, ai)),
    onBump: (si: number, ti: number, sti: number, ai: number, max: number) =>
      bump(actionKey(planId, si, ti, sti, ai), max),
  };
}
