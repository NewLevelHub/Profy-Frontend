import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { psychologistApi } from '@/shared/api/psychologist';

/**
 * PRO-338 Ф0.4 — all data fetching/derived state for the specialist report
 * screen lives here (Frontend-arch.md: page = assembly, hook = logic).
 *
 * Two independent queries: `testResults` (GET .../test-results) is the pure,
 * narrative-free surface the "Психодиагностика и тесты" tab renders;
 * `ai_analysis` still comes from GET .../report (unchanged — it needs the
 * full student-shape report server-side to pick a profession out of
 * `report.careers`, see psych_ai_analysis_validator.py), but that payload's
 * `report`/`new_tests` fields are no longer read here, only `ai_analysis`.
 *
 * A 404 means one of three things the router can't tell apart on its own
 * (unassigned student, assessment doesn't belong to this student, or no
 * report generated yet) — the page doesn't need to distinguish them either,
 * it just shows "no report" either way, same as the student's own /results
 * 404 handling.
 */
export function usePsychologistReport(studentId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  const enabled = !!studentId && !!assessmentId;
  const retry = (failureCount: number, err: unknown) => {
    const status = (err as AxiosError)?.response?.status;
    if (status === 403 || status === 404) return false;
    return failureCount < 2;
  };

  const testResultsKey = ['psychologistTestResults', studentId, assessmentId] as const;
  const {
    data: testResults,
    isLoading: isTestResultsLoading,
    error: testResultsError,
    refetch: refetchTestResults,
  } = useQuery({
    queryKey: testResultsKey,
    queryFn: () => psychologistApi.getTestResults(studentId, assessmentId),
    enabled,
    retry,
  });

  const reportKey = ['psychologistReport', studentId, assessmentId] as const;
  const { data, isLoading: isAiAnalysisLoading, refetch: refetchReport } = useQuery({
    queryKey: reportKey,
    queryFn: () => psychologistApi.getReport(studentId, assessmentId),
    enabled,
    retry,
  });

  // "Обновить анализ" — bypasses the server-side cache (e.g. after the
  // psychologist finishes assigning/scoring an extended block like
  // Belbin/АСТУР). Patches the already-loaded report in the query cache
  // directly instead of refetching the whole report over the network.
  const regenerate = useMutation({
    mutationFn: () => psychologistApi.regenerateReportAiAnalysis(studentId, assessmentId),
    onSuccess: (aiAnalysis) => {
      queryClient.setQueryData(reportKey, (prev: typeof data) =>
        prev ? { ...prev, ai_analysis: aiAnalysis } : prev,
      );
    },
  });

  const status = (testResultsError as AxiosError | null)?.response?.status;

  return {
    testResults: testResults ?? null,
    aiAnalysis: data?.ai_analysis ?? null,
    isLoading: isTestResultsLoading || isAiAnalysisLoading,
    notFound: status === 404,
    forbidden: status === 403,
    error:
      !testResults && testResultsError && status !== 404 && status !== 403
        ? 'Не удалось загрузить отчёт'
        : null,
    refetch: () => {
      void refetchTestResults();
      void refetchReport();
    },
    regenerateAiAnalysis: regenerate.mutate,
    regeneratingAiAnalysis: regenerate.isPending,
    regenerateAiAnalysisError: regenerate.isError,
  };
}
