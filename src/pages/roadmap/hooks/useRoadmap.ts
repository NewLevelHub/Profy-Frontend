import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roadmapApi } from '@/shared/api/roadmap';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useRoadmap() {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const queryClient = useQueryClient();

  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ['roadmap', assessmentId] as const,
    queryFn: () => roadmapApi.get(assessmentId!),
    enabled: hasCompletedAssessment && !!assessmentId,
    staleTime: 1000 * 60 * 5,
  });

  const generateMutation = useMutation({
    mutationFn: (programId?: string) => roadmapApi.generate(assessmentId!, programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', assessmentId] });
    },
  });

  return {
    roadmap: roadmap ?? null,
    isLoading: isLoading && !roadmap,
    error: error ? 'Не удалось загрузить роадмап. Попробуй ещё раз.' : null,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.isError
      ? 'Не удалось сгенерировать роадмап. Попробуй ещё раз.'
      : null,
    generate: (programId?: string) => generateMutation.mutate(programId),
  };
}
