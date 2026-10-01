import { useAssessmentStore } from '@/shared/store/assessment';
import { journeyProgressPercent } from '@/shared/lib/journeyProgress';

/** Rail fill for the current assessment screen — store counters + optional local phase fractions. */
export function useAssessmentJourneyProgress(local?: {
  belbinFraction?: number;
  asturFraction?: number;
}): number {
  const answeredCount = useAssessmentStore((s) => s.answeredCount);
  const totalQuestions = useAssessmentStore((s) => s.totalQuestions);
  const motivationAnsweredCount = useAssessmentStore((s) => s.motivationAnsweredCount);
  const motivationTotal = useAssessmentStore((s) => s.motivationTotal);
  const belbinCompleted = useAssessmentStore((s) => s.belbinCompleted);
  const asturCompleted = useAssessmentStore((s) => s.asturCompleted);

  return journeyProgressPercent({
    answeredCount,
    totalQuestions,
    motivationAnsweredCount,
    motivationTotal,
    belbinCompleted,
    asturCompleted,
    ...local,
  });
}
