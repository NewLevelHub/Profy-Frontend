import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { roadmapApi } from '@/shared/api/roadmap';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import type { RoadmapHorizonKey } from '@/shared/types';

export function useRoadmap() {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const clearReport = useResultStore(s => s.clearReport);
  const queryClient = useQueryClient();

  const [selectedHorizon, setSelectedHorizon] = useState<RoadmapHorizonKey | null>(null);

  const { data: roadmap, isLoading, error, refetch } = useQuery({
    queryKey: ['roadmap', assessmentId] as const,
    queryFn: () => roadmapApi.get(assessmentId!),
    enabled: hasCompletedAssessment && !!assessmentId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 404) return false;
      if ((err as AxiosError)?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });

  const is403 = (error as AxiosError | null)?.response?.status === 403;
  const is404 = (error as AxiosError | null)?.response?.status === 404;

  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  // Reset horizon selection when roadmap changes
  useEffect(() => {
    setSelectedHorizon(null);
  }, [roadmap?.id]);

  const loadError = error && !is404 && !is403 ? 'Не удалось загрузить роадмап. Попробуй ещё раз.' : null;

  const generateMutation = useMutation({
    mutationFn: (programId?: string) => roadmapApi.generate(assessmentId!, programId),
    onSuccess: (data) => {
      queryClient.setQueryData(['roadmap', assessmentId], data);
    },
  });

  const activeMilestone = roadmap?.milestones.find(m => m.horizon === selectedHorizon) ?? null;

  return {
    roadmap: roadmap ?? null,
    isLoading: isLoading && !roadmap,
    error: loadError,
    notGenerated: hasCompletedAssessment && !isLoading && !roadmap && !loadError,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.isError
      ? 'Не удалось составить план. Попробуй ещё раз.'
      : null,
    generate: (programId?: string) => generateMutation.mutate(programId),
    refetch,
    hasCompletedAssessment,
    selectedHorizon,
    setSelectedHorizon,
    activeMilestone,
  };
}
