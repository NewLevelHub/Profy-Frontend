import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ROUTES } from '@/app/routes';
import type { GoalSelectionState } from '@/app/routes';
import { assessmentApi } from '@/shared/api/assessment';
import { resultApi } from '@/shared/api/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';
import { useTypedLocationState } from '@/shared/hooks/useTypedLocationState';
import type { AssessmentGoal } from '@/shared/types';
import type { AxiosError } from 'axios';

export function useGoalSelection() {
  const navigate = useNavigate();
  const fromRestart = !!useTypedLocationState<GoalSelectionState>().fromRestart;
  const setAssessment = useAssessmentStore(s => s.setAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const [resumeOpen, setResumeOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);

  const { data: current, isLoading: isCheckingCurrent } = useQuery({
    queryKey: ['assessment', 'current'],
    queryFn: () =>
      assessmentApi.current().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    retry: false,
    // Must always reflect the real server state on mount — this page can be
    // revisited within the same session right after finishing an assessment
    // (e.g. via the sidebar), and a stale cached "in_progress"/"not_started"
    // status from before completion would send the student back into the
    // resume flow instead of showing the "already completed" state.
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!isCheckingCurrent) {
      if (current?.status === 'in_progress') setResumeOpen(true);
      else if (current?.status === 'completed' && !fromRestart) setRestartOpen(true);
    }
  }, [isCheckingCurrent, current, fromRestart]);

  // Reuses the ['result', id] cache with useResults/useHome — if the student
  // already visited /results or /home this session, this never refetches.
  // Validated against `current.id` (the server-confirmed assessment, just
  // fetched above) rather than the assessment store — a stale cached report
  // from a since-abandoned assessment must not block this refetch (see
  // useValidatedReport for the general version of this problem; this hook
  // needs its own copy because it's keyed to `current`, not the store's
  // assessmentId).
  const rawReport = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const reportIsStale = rawReport != null && rawReport.assessment_id !== current?.id;
  const report = reportIsStale ? null : rawReport;
  useEffect(() => {
    if (reportIsStale) clearReport();
  }, [reportIsStale, clearReport]);
  const { data: fetchedResult, isLoading: isResultLoading } = useQuery({
    queryKey: ['result', current?.id] as const,
    queryFn: () => resultApi.get(current!.id),
    enabled: restartOpen && !report && !!current?.id,
    retry: false,
  });
  useEffect(() => {
    if (fetchedResult && !report) setReport(fetchedResult);
  }, [fetchedResult, report, setReport]);
  const effectiveReport = report ?? fetchedResult ?? null;

  const [confirmRestart, setConfirmRestart] = useState(false);

  const startMutation = useMutation({
    mutationFn: (goal: AssessmentGoal) => assessmentApi.start(goal),
    onSuccess: (assessment) => {
      resetAssessment();
      setAssessment(assessment.id, assessment.goal, assessment.is_akinator);
      navigate(ROUTES.assessment);
    },
  });

  function handleGoalSelect(goal: AssessmentGoal) {
    startMutation.mutate(goal);
  }

  function handleResume() {
    if (current) {
      // Sync full assessment data into the store before entering the assessment flow.
      const userId = useAuthStore.getState().user?.id;
      if (userId) useAssessmentStore.getState().syncFromServer(current, userId);
      setAssessment(current.id, current.goal, current.is_akinator);
      navigate(ROUTES.assessment);
    }
  }

  function handleStartNew() {
    setResumeOpen(false);
  }

  function handleViewResults() {
    // Sync store before navigating so ResultsPage (inside AppLayout) has the correct
    // hasCompletedAssessment flag even before useAssessmentSync's async call completes.
    if (current) {
      const userId = useAuthStore.getState().user?.id;
      if (userId) useAssessmentStore.getState().syncFromServer(current, userId);
    }
    navigate(ROUTES.results);
  }

  function handleRestartRequest() {
    setConfirmRestart(true);
  }

  function handleRestartConfirm() {
    setConfirmRestart(false);
    setRestartOpen(false);
    resetAssessment();
    clearReport();
  }

  function handleRestartCancel() {
    setConfirmRestart(false);
  }

  return {
    ageGroup,
    isLoading: startMutation.isPending,
    isCheckingCurrent,
    error: startMutation.isError ? 'Не удалось начать тест. Попробуй ещё раз.' : null,
    resumeOpen,
    restartOpen,
    currentGoal: current?.goal ?? null,
    handleGoalSelect,
    handleResume,
    handleStartNew,
    handleViewResults,
    completedAt: effectiveReport?.completed_at ?? effectiveReport?.created_at ?? null,
    directionName: effectiveReport?.direction_name ?? null,
    questionsAnswered: effectiveReport?.questions_answered ?? null,
    matchPercent: effectiveReport?.match_percent ?? null,
    isCompletionLoading: restartOpen && isResultLoading && !effectiveReport,
    confirmRestart,
    handleRestartRequest,
    handleRestartConfirm,
    handleRestartCancel,
  };
}
