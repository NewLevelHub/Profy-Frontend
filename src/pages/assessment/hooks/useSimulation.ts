import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentApi } from '@/shared/api/assessment';
import type { SimulationSubmitResponse } from '@/shared/types';

// RJP (Realistic Job Preview) simulation for one leaf direction — a distinct
// entry point from the cluster resolver (see useAkinatorAssessment): steps
// with consequences, then an explicit accept/reject, never auto-triggered.
export function useSimulation(assessmentId: string, leafSlug: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['simulation', assessmentId, leafSlug] as const,
    queryFn: () => assessmentApi.getSimulation(assessmentId, leafSlug),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { accepted: boolean; answers: number[] }): Promise<SimulationSubmitResponse> =>
      assessmentApi.submitSimulation(assessmentId, leafSlug, payload),
  });

  return {
    steps: data?.steps ?? [],
    isLoading,
    error: !!error,
    submit: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.isError,
  };
}
