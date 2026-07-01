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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['result', assessmentId] as const,
    queryFn: async () => {
      try {
        return await resultApi.get(assessmentId!);
      } catch (err) {
        if ((err as AxiosError)?.response?.status === 404) {
          return await resultApi.generate(assessmentId!);
        }
        throw err;
      }
    },
    enabled: hasCompletedAssessment && !report && !!assessmentId,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

  // Stale assessmentId from a previous user's session — clear it
  const is403 = (error as AxiosError | null)?.response?.status === 403;
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  const effectiveReport = report ?? data ?? null;

  const topInterests = Object.entries(effectiveReport?.interests_map ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7);

  const topThinking = Object.entries(effectiveReport?.thinking_style ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return {
    report: effectiveReport,
    isLoading: isLoading && !effectiveReport,
    error: (!is403 && error) ? 'Не удалось загрузить результаты. Попробуй ещё раз.' : null,
    hasCompletedAssessment,
    goal,
    ageGroup,
    showUniversityBtn: goal === 'university' && ageGroup === 'senior',
    topInterests,
    topThinking,
    refetch,
  };
}
