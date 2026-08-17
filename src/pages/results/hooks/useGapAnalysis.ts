import { useLocation, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { universityApi } from '@/shared/api/university';
import { directionRoadmapApi } from '@/shared/api/directionRoadmap';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useDirectionRoadmapStore } from '@/shared/store/directionRoadmap';

interface LocationState {
  programName?: string;
  universityName?: string;
}

export function useGapAnalysis() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const queryClient = useQueryClient();
  const setRoadmap = useDirectionRoadmapStore(s => s.setRoadmap);

  const { programName, universityName } = (state ?? {}) as LocationState;

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['gap-analysis', programId, assessmentId] as const,
    queryFn: () => universityApi.getGapAnalysis(programId!, assessmentId!),
    enabled: !!programId && !!assessmentId,
  });

  // Сценарий C: без ИИ-опроса — направление резолвится на бэкенде из
  // program_id. Генерируем прямо здесь и уходим на уже готовый план, чтобы
  // не заводить вторую точку триггера генерации на DirectionRoadmapPage.
  const buildPlanMutation = useMutation({
    mutationFn: () => directionRoadmapApi.generateForProgram(assessmentId!, programId!),
    onSuccess: (data) => {
      queryClient.setQueryData(['direction-roadmap', assessmentId, data.direction_slug], data);
      setRoadmap(data);
      navigate(`/results/directions/${encodeURIComponent(data.direction_slug)}/roadmap`);
    },
  });

  function handleBuildPlan() {
    if (assessmentId && programId && !buildPlanMutation.isPending) buildPlanMutation.mutate();
  }

  return {
    result,
    isLoading,
    error: error ? 'Не удалось загрузить анализ. Попробуй ещё раз.' : null,
    assessmentId,
    programName,
    universityName,
    handleBuildPlan,
    isBuildingPlan: buildPlanMutation.isPending,
    buildPlanError: buildPlanMutation.isError
      ? ((buildPlanMutation.error as AxiosError<{ detail?: string }>).response?.data?.detail
          ?? 'Не удалось составить план. Попробуй ещё раз.')
      : null,
    refetch,
  };
}
