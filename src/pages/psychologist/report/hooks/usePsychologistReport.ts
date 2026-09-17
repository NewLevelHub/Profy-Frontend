import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { psychologistApi } from '@/shared/api/psychologist';

/**
 * PRO-338 Ф0.4 — all data fetching/derived state for the specialist report
 * screen lives here (Frontend-arch.md: page = assembly, hook = logic).
 *
 * A 404 means one of three things the router can't tell apart on its own
 * (unassigned student, assessment doesn't belong to this student, or no
 * report generated yet) — the page doesn't need to distinguish them either,
 * it just shows "no report" either way, same as the student's own /results
 * 404 handling.
 */
export function usePsychologistReport(studentId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['psychologistReport', studentId, assessmentId] as const;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => psychologistApi.getReport(studentId, assessmentId),
    enabled: !!studentId && !!assessmentId,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

  // "Обновить анализ" — bypasses the server-side cache (e.g. after the
  // psychologist finishes assigning/scoring an extended block like
  // Belbin/АСТУР). Patches the already-loaded report in the query cache
  // directly instead of refetching the whole report over the network.
  const regenerate = useMutation({
    mutationFn: () => psychologistApi.regenerateReportAiAnalysis(studentId, assessmentId),
    onSuccess: (aiAnalysis) => {
      queryClient.setQueryData(queryKey, (prev: typeof data) =>
        prev ? { ...prev, ai_analysis: aiAnalysis } : prev,
      );
    },
  });

  const status = (error as AxiosError | null)?.response?.status;

  return {
    report: data?.report ?? null,
    newTests: data?.new_tests ?? null,
    aiAnalysis: data?.ai_analysis ?? null,
    isLoading,
    notFound: status === 404,
    forbidden: status === 403,
    error: !data && error && status !== 404 && status !== 403 ? 'Не удалось загрузить отчёт' : null,
    refetch,
    regenerateAiAnalysis: regenerate.mutate,
    regeneratingAiAnalysis: regenerate.isPending,
    regenerateAiAnalysisError: regenerate.isError,
  };
}
