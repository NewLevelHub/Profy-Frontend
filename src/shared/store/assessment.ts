import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

interface AssessmentState {
  userId: string | null;
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  hasCompletedAssessment: boolean;
  isAkinator: boolean;
  syncDone: boolean;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, isAkinator: boolean) => void;
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
      hasCompletedAssessment: false,
      isAkinator: false,
      syncDone: false,
      setAssessment: (assessmentId, goal, isAkinator) =>
        set({ assessmentId, goal, isAkinator }),
      completeAssessment: () => set({ hasCompletedAssessment: true }),
      resetAssessment: () =>
        set({
          userId: null,
          assessmentId: null,
          goal: null,
          hasCompletedAssessment: false,
          isAkinator: false,
          syncDone: true,
        }),
      syncFromServer: (data, userId) =>
        set({
          userId,
          assessmentId: data.id,
          goal: data.goal,
          hasCompletedAssessment: data.status === 'completed',
          isAkinator: data.is_akinator ?? false,
          syncDone: true,
        }),
      clearForUser: (userId) =>
        set({
          userId,
          assessmentId: null,
          goal: null,
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
