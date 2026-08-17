import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { resultApi } from '@/shared/api/result';

export function useHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const answeredCount = useAssessmentStore(s => s.answeredCount);
  const totalQuestions = useAssessmentStore(s => s.totalQuestions);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);

  const hasAssessment = assessmentId !== null && goal !== null;
  const isCompleted = hasAssessment && hasCompletedAssessment;
  const inProgress = hasAssessment && !isCompleted;

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';
  const initial = displayName[0]?.toUpperCase() ?? 'A';

  // ── Diagnostic report — same query key as useResults (src/pages/results),
  // so react-query's cache is shared and visiting /home right after
  // finishing the assessment doesn't force a second network round-trip
  // once /results has already loaded it (or vice versa).
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);

  const { data, isLoading: isReportLoading } = useQuery({
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
    enabled: isCompleted && !report && !!assessmentId,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

  const effectiveReport = report ?? data ?? null;
  const isJunior = effectiveReport?.interest_instrument === 'mi';

  function handleContinue() {
    if (isCompleted) {
      navigate('/assessment/loading');
    } else if (inProgress) {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  return {
    displayName,
    initial,
    hasAssessment,
    isCompleted,
    inProgress,
    answeredCount,
    totalQuestions,
    handleContinue,
    report: effectiveReport,
    isReportLoading: isCompleted && !effectiveReport && isReportLoading,
    isJunior,
  };
}
