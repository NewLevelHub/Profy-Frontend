import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { assessmentApi } from '@/shared/api/assessment';
import type { SimulationSubmitResponse } from '@/shared/types';

// RJP (Realistic Job Preview) simulation for one leaf direction — a distinct
// entry point from the cluster resolver (see useAkinatorAssessment): steps
// with consequences, then an explicit accept/reject, never auto-triggered.
export function useSimulation(assessmentId: string, leafSlug: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['simulation', assessmentId, leafSlug] as const,
    queryFn: () => assessmentApi.getSimulation(assessmentId, leafSlug),
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  // Content coverage is still partial — most leaves don't have a written
  // simulation yet. Distinct from a real failure so the card can offer a way
  // forward (accept anyway) instead of a dead end.
  const notFound = (error as AxiosError | null)?.response?.status === 404;

  const submitMutation = useMutation({
    mutationFn: (payload: { accepted: boolean; answers: number[] }): Promise<SimulationSubmitResponse> =>
      assessmentApi.submitSimulation(assessmentId, leafSlug, payload),
  });

  return {
    steps: data?.steps ?? [],
    isLoading,
    error: !!error && !notFound,
    notFound,
    submit: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.isError,
  };
}
