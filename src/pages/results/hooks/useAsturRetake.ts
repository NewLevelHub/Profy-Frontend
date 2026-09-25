import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
import { asturAttemptQueryKey, asturStateQueryKey } from '@/pages/assessment/astur/hooks/useAsturAssessment';

/** «Пройти заново» for АСТУР from the student's results (PRO-427). Only
 *  offered once an attempt has been completed; an open retake is shown as
 *  "continue" and never replaces the finished result. */
export function useAsturRetake(assessmentId: string | null) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  const { data: state } = useQuery({
    queryKey: asturStateQueryKey(assessmentId ?? ''),
    queryFn: () => asturApi.getState(assessmentId!),
    enabled: !!assessmentId,
  });

  const completedRun = state?.latest_completed_run ?? null;
  const testRoute = `/assessment/astur/${assessmentId}`;

  async function confirmRetake() {
    if (!assessmentId) return;
    setStarting(true);
    setFailed(false);
    try {
      const opened = await asturApi.openAttempt(assessmentId, true);
      queryClient.setQueryData(asturAttemptQueryKey(assessmentId), opened);
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
      setConfirmOpen(false);
      navigate(testRoute);
    } catch {
      setFailed(true);
    } finally {
      setStarting(false);
    }
  }

  return {
    visible: !!completedRun,
    completedAt: completedRun?.completed_at ?? null,
    retakeInProgress: state?.status === 'in_progress' && !!completedRun,
    confirmOpen,
    starting,
    failed,
    openConfirm: () => setConfirmOpen(true),
    cancelConfirm: () => setConfirmOpen(false),
    confirmRetake,
    continueRetake: () => navigate(testRoute),
  };
}
