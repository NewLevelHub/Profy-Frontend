import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

// "Привал" (rest stop) cadence — appears at 25/50/75% of the way through
// the WHOLE assessment run (likert+pairs AND motivation phases combined,
// against their combined total), independent of block boundaries. 100% is
// completion, not a rest stop, so there are at most 3 per run.
const REST_STOP_THRESHOLDS = [25, 50, 75] as const;

// "Too fast" per-answer cutoff and the run-wide ratio band that triggers a
// one-time speed nudge — matches RestStopPage's speed-flag copy ("Ты идёшь
// быстрее, чем успеваешь прочитать"), shown once per run when 15-35% of
// answers so far (across all 4 assessment flows) landed under the cutoff.
// Below MIN_SAMPLE the ratio isn't meaningful yet (e.g. 1/1 = 100% off a
// single quick answer), so it's never evaluated that early.
const SPEED_FLAG_TOO_FAST_MS = 2000;
const SPEED_FLAG_MIN_RATIO = 15;
const SPEED_FLAG_MAX_RATIO = 35;
const SPEED_FLAG_MIN_SAMPLE = 4;

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

  // ── Speed-flag state ─────────────────────────────────────────────────────
  /** Answers so far this run (any of the 4 flows) that landed under
   *  SPEED_FLAG_TOO_FAST_MS. */
  fastAnswerCount: number;
  /** Total answers this run that have had their timing recorded — a plain
   *  running denominator, independent of answeredCount/motivationAnsweredCount
   *  (which track server-confirmed progress per phase, not timing). */
  timedAnswerCount: number;
  /** The speed nudge is shown at most once per run. */
  speedFlagShown: boolean;

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

  /**
   * Call once per answer, right after it's saved, with how long the student
   * spent on it (ms from when the item was shown to when they answered) —
   * any of the 4 assessment flows. Returns true the moment the run-wide
   * "too fast" ratio first lands in [SPEED_FLAG_MIN_RATIO,
   * SPEED_FLAG_MAX_RATIO]%, at which point the caller should show the
   * speed-flag rest stop instead of (or alongside) the normal cadence one —
   * always false after the first true this run.
   */
  recordAnswerTiming: (elapsedMs: number) => boolean;
}

const REST_STOP_INITIAL_STATE = {
  restStopThresholdsShown: [] as number[],
};

const SPEED_FLAG_INITIAL_STATE = {
  fastAnswerCount: 0,
  timedAnswerCount: 0,
  speedFlagShown: false,
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
      ...SPEED_FLAG_INITIAL_STATE,
      setAssessment: (assessmentId, goal, answeredCount, totalQuestions, motivationAnsweredCount = 0, motivationTotal = 0) =>
        set({
          assessmentId,
          goal,
          answeredCount,
          totalQuestions,
          motivationAnsweredCount,
          motivationTotal,
          ...REST_STOP_INITIAL_STATE,
          ...SPEED_FLAG_INITIAL_STATE,
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
          ...SPEED_FLAG_INITIAL_STATE,
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
          ...SPEED_FLAG_INITIAL_STATE,
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
      recordAnswerTiming: (elapsedMs) => {
        const state = get();
        const fastAnswerCount = state.fastAnswerCount + (elapsedMs < SPEED_FLAG_TOO_FAST_MS ? 1 : 0);
        const timedAnswerCount = state.timedAnswerCount + 1;
        set({ fastAnswerCount, timedAnswerCount });

        if (state.speedFlagShown || timedAnswerCount < SPEED_FLAG_MIN_SAMPLE) return false;

        const ratio = (fastAnswerCount / timedAnswerCount) * 100;
        if (ratio >= SPEED_FLAG_MIN_RATIO && ratio <= SPEED_FLAG_MAX_RATIO) {
          set({ speedFlagShown: true });
          return true;
        }
        return false;
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
