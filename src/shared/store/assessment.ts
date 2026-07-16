import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

interface AssessmentState {
  userId: string | null;
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  currentBlock: number;
  completedBlocks: string[];
  hasCompletedAssessment: boolean;
  isAkinator: boolean;
  syncDone: boolean;
  setAssessment: (
    assessmentId: string,
    goal: AssessmentGoal,
    currentBlock: number,
    isAkinator: boolean
  ) => void;
  advanceBlock: () => void;
  markBlockCompleted: (block: string) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  syncFromServer: (data: AssessmentResponse, userId: string) => void;
  clearForUser: (userId: string) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      userId: null,
      assessmentId: null,
      goal: null,
      currentBlock: 0,
      completedBlocks: [],
      hasCompletedAssessment: false,
      isAkinator: false,
      syncDone: false,
      setAssessment: (assessmentId, goal, currentBlock, isAkinator) =>
        set({ assessmentId, goal, currentBlock, isAkinator }),
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
          userId: null,
          assessmentId: null,
          goal: null,
          currentBlock: 0,
          completedBlocks: [],
          hasCompletedAssessment: false,
          isAkinator: false,
          syncDone: true,
        }),
      syncFromServer: (data, userId) =>
        set({
          userId,
          assessmentId: data.id,
          goal: data.goal,
          currentBlock: data.current_block,
          completedBlocks: [],
          hasCompletedAssessment: data.status === 'completed',
          isAkinator: data.is_akinator ?? false,
          syncDone: true,
        }),
      clearForUser: (userId) =>
        set({
          userId,
          assessmentId: null,
          goal: null,
          currentBlock: 0,
          completedBlocks: [],
          hasCompletedAssessment: false,
          isAkinator: false,
          syncDone: true,
        }),
    }),
    {
      name: 'profy-assessment',
      partialize: ({ syncDone: _syncDone, ...rest }) => rest,
    },
  ),
);
