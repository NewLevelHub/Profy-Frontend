import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { resultApi } from '@/shared/api/result';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';

export function useResults() {
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  // No generate-on-404 fallback anymore: the akinator's own reveal + feedback
  // already produced the result, so a 404 here means "not ready yet", not
  // "needs generating" — surfaced as isNotReady, not as an error.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['result', assessmentId] as const,
    queryFn: () => resultApi.get(assessmentId!),
    enabled: hasCompletedAssessment && !report && !!assessmentId,
    retry: (failureCount, err) => {
      const status = (err as AxiosError)?.response?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

  const status = (error as AxiosError | null)?.response?.status;
  const is403 = status === 403;
  const isNotReady = status === 404;

  // Stale assessmentId from a previous user's session — clear it
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  const effectiveReport = report ?? data ?? null;

  return {
    report: effectiveReport,
    isLoading: isLoading && !effectiveReport,
    isNotReady,
    error: (!is403 && !isNotReady && error) ? 'Не удалось загрузить результат. Попробуй ещё раз.' : null,
    hasCompletedAssessment,
    showUniversityBtn: goal === 'university' && ageGroup === 'senior',
    refetch,
  };
}
