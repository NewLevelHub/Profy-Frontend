import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

// "Привал" (rest stop) cadence — ТЗ: appears every 10-12 RAW questions
// answered, across the whole assessment run (likert+pairs AND motivation
// phases combined), independent of block boundaries. Capped at 5 stops
// per full test run. Picking a fresh random 10-12 threshold after each
// stop is what produces the "every 10-12" cadence rather than a fixed one.
const MAX_REST_STOPS = 5;
const REST_STOP_MIN_GAP = 10;
const REST_STOP_MAX_GAP = 12;

function randomRestStopThreshold(): number {
  return REST_STOP_MIN_GAP + Math.floor(Math.random() * (REST_STOP_MAX_GAP - REST_STOP_MIN_GAP + 1));
}

export interface RestStopCheckResult {
  shouldShow: boolean;
  /** Running count of questions answered so far this run — used for the
   *  neutral-fallback copy ("Прошли N, идём ровно") when no real
   *  behavioral signal exists to back a genuine micro-insight. */
  totalAnswered: number;
}

interface AssessmentState {
  userId: string | null;
  assessmentId: string | null;
  goal: AssessmentGoal | null;
  answeredCount: number;
  totalQuestions: number;
  hasCompletedAssessment: boolean;
  syncDone: boolean;

  // ── Привал (rest stop) cadence state ────────────────────────────────────
  restStopsShown: number;
  questionsSinceRestStop: number;
  nextRestStopThreshold: number;
  totalRawAnswered: number;

  setAssessment: (assessmentId: string, goal: AssessmentGoal, answeredCount: number, totalQuestions: number) => void;
  setProgress: (answeredCount: number, totalQuestions: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
  syncFromServer: (data: AssessmentResponse, userId: string) => void;
  clearForUser: (userId: string) => void;

  /**
   * Call once per raw question answered (any of the 4 assessment flows).
   * Advances the rest-stop cadence counter and reports whether a rest
   * stop should be shown now — real, client-observable counting, not a
   * fabricated signal.
   */
  recordQuestionAnswered: () => RestStopCheckResult;
}

const REST_STOP_INITIAL_STATE = {
  restStopsShown: 0,
  questionsSinceRestStop: 0,
  nextRestStopThreshold: randomRestStopThreshold(),
  totalRawAnswered: 0,
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      userId: null,
      assessmentId: null,
      goal: null,
      answeredCount: 0,
      totalQuestions: 0,
      hasCompletedAssessment: false,
      syncDone: false,
      ...REST_STOP_INITIAL_STATE,
      setAssessment: (assessmentId, goal, answeredCount, totalQuestions) =>
        set({ assessmentId, goal, answeredCount, totalQuestions, ...REST_STOP_INITIAL_STATE }),
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
          ...REST_STOP_INITIAL_STATE,
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
          ...REST_STOP_INITIAL_STATE,
        }),
      recordQuestionAnswered: () => {
        const state = get();
        const totalRawAnswered = state.totalRawAnswered + 1;
        const questionsSinceRestStop = state.questionsSinceRestStop + 1;
        const shouldShow =
          state.restStopsShown < MAX_REST_STOPS && questionsSinceRestStop >= state.nextRestStopThreshold;

        if (shouldShow) {
          set({
            totalRawAnswered,
            questionsSinceRestStop: 0,
            restStopsShown: state.restStopsShown + 1,
            nextRestStopThreshold: randomRestStopThreshold(),
          });
        } else {
          set({ totalRawAnswered, questionsSinceRestStop });
        }

        return { shouldShow, totalAnswered: totalRawAnswered };
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
