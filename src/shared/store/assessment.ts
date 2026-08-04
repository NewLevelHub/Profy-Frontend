import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

interface AssessmentState {
  userId: string | null;
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  answeredCount: number;
  totalQuestions: number;
  hasCompletedAssessment: boolean;
  syncDone: boolean;
  setAssessment: (assessmentId: string, goal: AssessmentGoal, answeredCount: number, totalQuestions: number) => void;
  setProgress: (answeredCount: number, totalQuestions: number) => void;
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
      answeredCount: 0,
      totalQuestions: 0,
      hasCompletedAssessment: false,
      syncDone: false,
      setAssessment: (assessmentId, goal, answeredCount, totalQuestions) =>
        set({ assessmentId, goal, answeredCount, totalQuestions }),
      setProgress: (answeredCount, totalQuestions) =>
        set({ answeredCount, totalQuestions }),
      completeAssessment: () => set({ hasCompletedAssessment: true }),
      resetAssessment: () =>
        set({
          userId: null,
          assessmentId: null,
          goal: null,
          answeredCount: 0,
          totalQuestions: 0,
          hasCompletedAssessment: false,
          syncDone: true,
        }),
      syncFromServer: (data, userId) =>
        set({
          userId,
          assessmentId: data.id,
          goal: data.goal,
          answeredCount: data.answered_count,
          totalQuestions: data.total_questions,
          hasCompletedAssessment: data.status === 'completed',
          syncDone: true,
        }),
      clearForUser: (userId) =>
        set({
          userId,
          assessmentId: null,
          goal: null,
          answeredCount: 0,
          totalQuestions: 0,
          hasCompletedAssessment: false,
          syncDone: true,
        }),
    }),
    {
      name: 'profy-assessment',
      // syncDone must not be persisted — it should always start false on page load
      // so the UI waits for a fresh server sync before rendering content.
      partialize: ({ syncDone: _syncDone, ...rest }) => rest,
    },
  ),
);
