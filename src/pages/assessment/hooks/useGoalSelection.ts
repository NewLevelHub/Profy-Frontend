import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentApi } from '@/shared/api/assessment';
import { useAssessmentStore } from '@/shared/store/assessment';
import { usePsychoColorRunStore } from '@/shared/store/psychoemotional';
import { useResultStore } from '@/shared/store/result';
import { useAuthStore } from '@/shared/store/auth';
import { useEnsureProfile } from '@/shared/hooks/useEnsureProfile';
import type { AssessmentGoal } from '@/shared/types';
import type { AxiosError } from 'axios';

export function useGoalGuard() {
  const syncDone = useAssessmentStore(s => s.syncDone);
  const hasCompletedAssessmentFlag = useAssessmentStore(s => s.hasCompletedAssessment);
  const answeredCount = useAssessmentStore(s => s.answeredCount);
  const totalQuestions = useAssessmentStore(s => s.totalQuestions);
  const motivationAnsweredCount = useAssessmentStore(s => s.motivationAnsweredCount);
  const motivationTotal = useAssessmentStore(s => s.motivationTotal);
  // Cross-checked against live progress counters — see useFinishedAssessmentGuard
  // for why the raw flag alone can't be trusted.
  const hasCompletedAssessment =
    hasCompletedAssessmentFlag &&
    totalQuestions > 0 && answeredCount >= totalQuestions &&
    motivationTotal > 0 && motivationAnsweredCount >= motivationTotal;
  // Redirect to results if user already has completed assessment (guard fires from store)
  const shouldRedirect = syncDone && hasCompletedAssessment;
  return { syncDone, shouldRedirect };
}

export function useGoalSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRestart = !!(location.state as { fromRestart?: boolean } | null)?.fromRestart;
  const setAssessment = useAssessmentStore(s => s.setAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const resetPsychoColorRun = usePsychoColorRunStore(s => s.reset);
  const clearReport = useResultStore(s => s.clearReport);
  // Экран вне RequireProfile: без запроса профиля восьмилетний после F5
  // читал бы формулировки для средней школы.
  const { profile } = useEnsureProfile();
  const ageGroup = profile?.age_group ?? 'middle';

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

  // Captured in a ref at click time (not read inside onSuccess) so it can't
  // go stale between the click and the mutation resolving. Same for the
  // NotStarted skip flag — location.state is cleared on navigate away.
  const wasFirstEverRef = useRef(false);
  const fromNotStartedRef = useRef(false);

  const startMutation = useMutation({
    mutationFn: (goal: AssessmentGoal) => assessmentApi.start(goal),
    onSuccess: (assessment) => {
      resetAssessment();
      // A brand-new assessment (new goal pick) starts its own circle 1 —
      // drop any leftover pending run from an abandoned previous attempt.
      resetPsychoColorRun();
      // Drop the previous attempt's report — otherwise /results keeps showing
      // it while the new one is pending_review (PRO-337), because useResults
      // only re-fetches when the stored locale mismatches.
      clearReport();
      setAssessment(
        assessment.id,
        assessment.goal,
        assessment.answered_count,
        assessment.total_questions,
        assessment.motivation_answered_count,
        assessment.motivation_total,
      );
      // First-ever attempt gets the "how this works" intro (/welcome) once —
      // unless the student just came from AssessmentNotStartedCard, which is the
      // same journey-shell intro (PRO-416). Retakes/resumes go straight in.
      // Either way, psychoemotional circle 1 comes before the main battery.
      const showWelcome = wasFirstEverRef.current && !fromNotStartedRef.current;
      navigate(showWelcome ? '/welcome' : '/assessment/psychoemotional-start');
    },
  });

  function handleGoalSelect(goal: AssessmentGoal) {
    wasFirstEverRef.current = current === null;
    fromNotStartedRef.current = !!(
      location.state as { fromNotStarted?: boolean } | null
    )?.fromNotStarted;
    startMutation.mutate(goal);
  }

  function handleResume() {
    if (current) {
      // Sync full assessment data into the store before entering the assessment flow.
      const userId = useAuthStore.getState().user?.id;
      if (userId) useAssessmentStore.getState().syncFromServer(current, userId);
      setAssessment(
        current.id,
        current.goal,
        current.answered_count,
        current.total_questions,
        current.motivation_answered_count,
        current.motivation_total,
      );
      // Routes through the same circle-1 gate as a fresh start — it skips
      // straight to /assessment on its own if this attempt already did it.
      navigate('/assessment/psychoemotional-start');
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

  // No assessment has been started yet at this point (picking a goal is
  // what starts one) — leaving here is a plain navigation, nothing to save
  // or confirm. Back to /results, which shows the "not started" prompt
  // again so the test stays one tap away whenever the student is ready.
  function handleSkip() {
    navigate('/results');
  }

  return {
    ageGroup,
    isLoading: startMutation.isPending,
    isCheckingCurrent,
    error: startMutation.isError ? t('assessment:error.startTest') : null,
    resumeOpen,
    restartOpen,
    currentGoal: current?.goal ?? null,
    handleGoalSelect,
    handleResume,
    handleStartNew,
    handleViewResults,
    handleConfirmRestart,
    handleSkip,
  };
}
