/**
 * Shared shape for the `navigate('/assessment/rest', { state })` call made
 * by all 4 assessment flows (useAssessment, usePairAssessment,
 * useMotivationAssessment, useMotivationHarter) when
 * useAssessmentStore.recordQuestionAnswered() reports a rest stop is due.
 * See RestStopPage.tsx for the full doc on why `microInsight` is always
 * left undefined today.
 */
export interface RestStopState {
  returnTo: string;
  progress: number;
  totalAnswered: number;
  microInsight?: string;
  /** True when this stop was triggered by useAssessmentStore.recordAnswerTiming
   *  (15-35% of answers so far were under the "too fast" cutoff), not the
   *  25/50/75% progress cadence — RestStopPage shows the speed-nudge copy
   *  instead of the normal privál. */
  isSpeedFlag?: boolean;
}
