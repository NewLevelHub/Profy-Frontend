import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

// "Привал" (rest stop) cadence — appears at 25/50/75% of the way through
// the WHOLE assessment run (likert+pairs AND motivation phases combined,
// against their combined total), independent of block boundaries. 100% is
// completion, not a rest stop, so there are at most 3 per run.
const REST_STOP_THRESHOLDS = [25, 50, 75] as const;

export interface RestStopCheckResult {
  shouldShow: boolean;
  /** Running count of questions answered so far this run (both phases
   *  combined) — used for the neutral-fallback copy ("Прошли N, идём
   *  ровно") when no real behavioral signal exists to back a genuine
   *  micro-insight. */
  totalAnswered: number;
}

interface AssessmentState {
  userId: string | null;
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  answeredCount: number;
  totalQuestions: number;
  // Motivation phase counts — tracked separately because it's a distinct
  // set of endpoints/resources, but combined with the fields above for the
  // run-wide percentage the rest-stop cadence and grand total are based on.
  motivationAnsweredCount: number;
  motivationTotal: number;
  hasCompletedAssessment: boolean;
  syncDone: boolean;

  // ── Привал (rest stop) cadence state ────────────────────────────────────
  /** Which of REST_STOP_THRESHOLDS have already been shown this run. */
  restStopThresholdsShown: number[];

  setAssessment: (
    assessmentId: string,
    goal: AssessmentGoal,
    answeredCount: number,
    totalQuestions: number,
    motivationAnsweredCount?: number,
    motivationTotal?: number,
  ) => void;
  setProgress: (answeredCount: number, totalQuestions: number) => void;
  setMotivationProgress: (motivationAnsweredCount: number, motivationTotal: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  syncFromServer: (data: AssessmentResponse, userId: string) => void;
  clearForUser: (userId: string) => void;

  /**
   * Call after every answer (any of the 4 assessment flows), once the
   * relevant progress setter above has already recorded the fresh
   * answered/total counts. Checks the combined run-wide percentage against
   * REST_STOP_THRESHOLDS and reports whether a rest stop should be shown
   * now — real, client-observable state, not a fabricated signal. If a
   * single update crosses more than one threshold at once (e.g. a batched
   * Likert page submit), all crossed thresholds are marked shown but only
   * one rest stop fires — no back-to-back interstitials for one jump.
   */
  recordQuestionAnswered: () => RestStopCheckResult;
}

const REST_STOP_INITIAL_STATE = {
  restStopThresholdsShown: [] as number[],
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      userId: null,
      assessmentId: null,
      goal: null,
      answeredCount: 0,
      totalQuestions: 0,
      motivationAnsweredCount: 0,
      motivationTotal: 0,
      hasCompletedAssessment: false,
      syncDone: false,
      ...REST_STOP_INITIAL_STATE,
      setAssessment: (assessmentId, goal, answeredCount, totalQuestions, motivationAnsweredCount = 0, motivationTotal = 0) =>
        set({
          assessmentId,
          goal,
          answeredCount,
          totalQuestions,
          motivationAnsweredCount,
          motivationTotal,
          ...REST_STOP_INITIAL_STATE,
        }),
      setProgress: (answeredCount, totalQuestions) =>
        set({ answeredCount, totalQuestions }),
      setMotivationProgress: (motivationAnsweredCount, motivationTotal) =>
        set({ motivationAnsweredCount, motivationTotal }),
      completeAssessment: () => set({ hasCompletedAssessment: true }),
      resetAssessment: () =>
        set({
          userId: null,
          assessmentId: null,
          goal: null,
          answeredCount: 0,
          totalQuestions: 0,
          motivationAnsweredCount: 0,
          motivationTotal: 0,
          hasCompletedAssessment: false,
          syncDone: true,
          ...REST_STOP_INITIAL_STATE,
        }),
      syncFromServer: (data, userId) =>
        set({
          userId,
          assessmentId: data.id,
          goal: data.goal,
          answeredCount: data.answered_count,
          totalQuestions: data.total_questions,
          motivationAnsweredCount: data.motivation_answered_count,
          motivationTotal: data.motivation_total,
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
          motivationAnsweredCount: 0,
          motivationTotal: 0,
          hasCompletedAssessment: false,
          syncDone: true,
          ...REST_STOP_INITIAL_STATE,
        }),
      recordQuestionAnswered: () => {
        const state = get();
        const totalAnswered = state.answeredCount + state.motivationAnsweredCount;
        const grandTotal = state.totalQuestions + state.motivationTotal;
        const percent = grandTotal > 0 ? (totalAnswered / grandTotal) * 100 : 0;

        const newlyCrossed = REST_STOP_THRESHOLDS.filter(
          t => percent >= t && !state.restStopThresholdsShown.includes(t),
        );

        if (newlyCrossed.length > 0) {
          set({ restStopThresholdsShown: [...state.restStopThresholdsShown, ...newlyCrossed] });
        }

        return { shouldShow: newlyCrossed.length > 0, totalAnswered };
      },
    }),
    {
      name: 'profy-assessment',
      // syncDone must not be persisted — it should always start false on page load
      // so the UI waits for a fresh server sync before rendering content.
      partialize: ({ syncDone: _syncDone, ...rest }) => rest,
    },
  ),
);
