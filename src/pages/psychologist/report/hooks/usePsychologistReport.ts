import { useQuery } from '@tanstack/react-query';
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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['psychologistReport', studentId, assessmentId] as const,
    queryFn: () => psychologistApi.getReport(studentId, assessmentId),
    enabled: !!studentId && !!assessmentId,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

  const status = (error as AxiosError | null)?.response?.status;

  return {
    report: data?.report ?? null,
    newTests: data?.new_tests ?? null,
    isLoading,
    notFound: status === 404,
    forbidden: status === 403,
    error: !data && error && status !== 404 && status !== 403 ? 'Не удалось загрузить отчёт' : null,
    refetch,
  };
}
