import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/app/routes';
import type { GapAnalysisState, ProgramParams } from '@/app/routes';
import { universityApi } from '@/shared/api/university';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useTypedLocationState } from '@/shared/hooks/useTypedLocationState';

export function useGapAnalysis() {
  const { slug, programId } = useParams<ProgramParams>();
  const navigate = useNavigate();
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const { programName, universityName } = useTypedLocationState<GapAnalysisState>();

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['gap-analysis', programId, assessmentId] as const,
    queryFn: () => universityApi.getGapAnalysis(programId!, assessmentId!),
    enabled: !!programId && !!assessmentId,
  });

  function handleBuildPlan() {
    // The general goal-roadmap (/roadmap) was retired with the old scoring
    // pipeline — direction-roadmap is the live plan builder now, and `slug`
    // (the program's direction) is already in this page's route.
    if (slug) navigate(ROUTES.directionRoadmap(slug));
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
