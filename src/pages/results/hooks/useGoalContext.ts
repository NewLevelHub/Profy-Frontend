import { useQuery } from '@tanstack/react-query';
import { resultApi } from '@/shared/api/result';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useGoalContext(programId?: string) {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);

  return useQuery({
    queryKey: ['goalContext', assessmentId, goal, programId] as const,
    queryFn: () => resultApi.getGoalContext(assessmentId!, programId),
    enabled: !!assessmentId,
  });
}
