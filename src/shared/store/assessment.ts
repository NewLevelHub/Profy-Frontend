import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal } from '@/shared/types';

interface AssessmentState {
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  currentBlock: number;
  completedBlocks: string[];
  hasCompletedAssessment: boolean;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, currentBlock: number) => void;
  advanceBlock: () => void;
  markBlockCompleted: (block: string) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessmentId: null,
      goal: null,
      currentBlock: 0,
      completedBlocks: [],
      hasCompletedAssessment: false,
      setAssessment: (assessmentId, goal, currentBlock) =>
        set({ assessmentId, goal, currentBlock }),
      advanceBlock: () =>
        set((s) => ({ currentBlock: s.currentBlock + 1 })),
      markBlockCompleted: (block) =>
        set((s) => ({
          completedBlocks: s.completedBlocks.includes(block)
            ? s.completedBlocks
            : [...s.completedBlocks, block],
        })),
      completeAssessment: () => set({ hasCompletedAssessment: true }),
      resetAssessment: () =>
        set({
          assessmentId: null,
          goal: null,
          currentBlock: 0,
          completedBlocks: [],
          hasCompletedAssessment: false,
        }),
    }),
    {
      name: 'profy-assessment',
    },
  ),
);
