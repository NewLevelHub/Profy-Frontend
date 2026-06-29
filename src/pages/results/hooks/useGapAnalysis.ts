import { useLocation, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';

interface LocationState {
  programName?: string;
  universityName?: string;
}

export function useGapAnalysis() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const { programName, universityName } = (state ?? {}) as LocationState;

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['gap-analysis', programId, assessmentId] as const,
    queryFn: () => universityApi.getGapAnalysis(programId!, assessmentId!),
    enabled: !!programId && !!assessmentId,
  });

  function handleBuildPlan() {
    navigate('/roadmap');
  }

  return {
    result,
    isLoading,
    error: error ? 'Не удалось загрузить анализ. Попробуй ещё раз.' : null,
    assessmentId,
    programName,
    universityName,
    handleBuildPlan,
    refetch,
  };
}
