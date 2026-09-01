import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Per-viewer progress over the development plan's micro-actions.
 * Key: `${planId}:${stageIdx}.${taskIdx}.${stepIdx}.${actionIdx}`.
 * Lives only in this browser (localStorage) — MVP, no backend sync.
 */
interface PlanProgressState {
  checked: Record<string, boolean>;
  counters: Record<string, number>;
  toggle: (key: string) => void;
  bump: (key: string, max: number) => void;
  resetPlan: (planId: string) => void;
}

export const usePlanProgressStore = create<PlanProgressState>()(
  persist(
    (set) => ({
      checked: {},
      counters: {},
      toggle: (key) =>
        set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),
      bump: (key, max) =>
        set((s) => {
          const next = ((s.counters[key] ?? 0) + 1) % (max + 1);
          return { counters: { ...s.counters, [key]: next } };
        }),
      resetPlan: (planId) =>
        set((s) => {
          const strip = <T,>(rec: Record<string, T>) =>
            Object.fromEntries(
              Object.entries(rec).filter(([k]) => !k.startsWith(`${planId}:`)),
            );
          return { checked: strip(s.checked), counters: strip(s.counters) };
        }),
    }),
    { name: 'profy-plan-progress' },
  ),
);
