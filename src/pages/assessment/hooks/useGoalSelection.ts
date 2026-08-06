import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentApi } from '@/shared/api/assessment';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import type { AssessmentGoal } from '@/shared/types';
import type { AxiosError } from 'axios';

export function useGoalGuard() {
  const syncDone = useAssessmentStore(s => s.syncDone);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  // Redirect to home if user already has completed assessment (guard fires from store)
  const shouldRedirect = syncDone && hasCompletedAssessment;
  return { syncDone, shouldRedirect };
}

export function useGoalSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRestart = !!(location.state as { fromRestart?: boolean } | null)?.fromRestart;
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
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isCheckingCurrent) {
      if (current?.status === 'in_progress') setResumeOpen(true);
      else if (current?.status === 'completed' && !fromRestart) setRestartOpen(true);
    }
  }, [isCheckingCurrent, current, fromRestart]);

  const startMutation = useMutation({
    mutationFn: (goal: AssessmentGoal) => assessmentApi.start(goal),
    onSuccess: (assessment) => {
      resetAssessment();
      setAssessment(assessment.id, assessment.goal, assessment.answered_count, assessment.total_questions);
      // Likert is banned for junior (TZ_Profi.md §13) — send them to the
      // forced-choice-pair flow instead.
      navigate(ageGroup === 'junior' ? '/assessment/pairs' : '/assessment');
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
      setAssessment(current.id, current.goal, current.answered_count, current.total_questions);
      navigate(ageGroup === 'junior' ? '/assessment/pairs' : '/assessment');
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
    navigate('/results');
  }

  function handleConfirmRestart() {
    setRestartOpen(false);
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
    handleConfirmRestart,
  };
}
