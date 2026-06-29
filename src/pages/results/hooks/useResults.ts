import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resultApi } from '@/shared/api/result';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';

export function useResults() {
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['result', assessmentId] as const,
    queryFn: () => resultApi.get(assessmentId!),
    enabled: hasCompletedAssessment && !report && !!assessmentId,
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

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
    error: error ? 'Не удалось загрузить результаты. Попробуй ещё раз.' : null,
    hasCompletedAssessment,
    goal,
    ageGroup,
    showUniversityBtn: goal === 'university' && ageGroup === 'senior',
    topInterests,
    topThinking,
    refetch,
  };
}
