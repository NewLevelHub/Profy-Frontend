import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useResultStore } from '@/shared/store/result';
import { resultApi } from '@/shared/api/result';
import { useKnownProfessionTree } from '@/pages/assessment/knownProfession/hooks/useKnownProfessionTree';

export type HomeStatus = 'not_started' | 'in_progress' | 'completed';

const SPHERES_PREVIEW_COUNT = 5;

export function useHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);

  const hasAssessment = assessmentId !== null && goal !== null;
  const status: HomeStatus = !hasAssessment
    ? 'not_started'
    : hasCompletedAssessment
    ? 'completed'
    : 'in_progress';

  const displayName =
    profile?.name?.trim().split(' ')[0] ||
    user?.name?.trim().split(' ')[0] ||
    'друг';

  const { data: sphereTree, isLoading: spheresLoading } = useKnownProfessionTree();
  const spheresPreview = sphereTree?.slice(0, SPHERES_PREVIEW_COUNT) ?? [];
  const spheresTotal = sphereTree?.length ?? 0;

  // Shares the ['result', assessmentId] cache with useResults — visiting
  // /results first (the common path) means this never refetches.
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const { data: fetchedResult, isLoading: isResultLoading } = useQuery({
    queryKey: ['result', assessmentId] as const,
    queryFn: () => resultApi.get(assessmentId!),
    enabled: status === 'completed' && !report && !!assessmentId,
    retry: false,
  });
  useEffect(() => {
    if (fetchedResult && !report) setReport(fetchedResult);
  }, [fetchedResult, report, setReport]);
  const effectiveReport = report ?? fetchedResult ?? null;

  const [confirmRestart, setConfirmRestart] = useState(false);

  function handleContinue() {
    if (status === 'completed') {
      navigate('/results');
    } else if (status === 'in_progress') {
      navigate('/assessment');
    } else {
      navigate('/assessment/goal');
    }
  }

  function goToSpheres() {
    navigate('/assessment/known-profession');
  }

  function goToSphere(slug: string) {
    navigate(`/assessment/known-profession/${slug}`);
  }

  function handleRestartRequest() {
    setConfirmRestart(true);
  }

  function handleRestartConfirm() {
    resetAssessment();
    clearReport();
    setConfirmRestart(false);
    navigate('/assessment/goal', { state: { fromRestart: true } });
  }

  function handleRestartCancel() {
    setConfirmRestart(false);
  }

  return {
    displayName,
    status,
    spheresPreview,
    spheresTotal,
    spheresLoading,
    handleContinue,
    goToSpheres,
    goToSphere,
    completedAt: effectiveReport?.completed_at ?? null,
    directionName: effectiveReport?.direction_name ?? null,
    questionsAnswered: effectiveReport?.questions_answered ?? null,
    matchPercent: effectiveReport?.match_percent ?? null,
    isCompletionLoading: status === 'completed' && isResultLoading && !effectiveReport,
    confirmRestart,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  };
}
