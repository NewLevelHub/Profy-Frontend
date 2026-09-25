import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import { asturAutofillAnswer } from '@/shared/dev/autofillAssessment';
import type { AsturContentSubtest, AsturSubtestKey, SubmitAsturSubtestPayload } from '@/shared/types';
import { useLocaleStore } from '@/shared/store/locale';

type StepPhase = 'instruction' | 'running';

export const asturStateQueryKey = (assessmentId: string) => ['asturState', assessmentId] as const;

function clientTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

/**
 * АСТУР attempt flow (PRO-338 Ф3.6, lifecycle PRO-427). Progress comes from
 * the server: `state.active_run.submitted_subtests` tells which subtests of
 * the open attempt are already in, so a reload or another device resumes
 * exactly where the attempt stands. A finished attempt is never extended —
 * a new one only starts through `startRetake` («Пройти заново»).
 */
export function useAsturAssessment(assessmentId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('assessment');
  const locale = useLocaleStore((s) => s.locale);

  const stateQuery = useQuery({
    queryKey: asturStateQueryKey(assessmentId),
    queryFn: () => asturApi.getState(assessmentId),
    enabled: !!assessmentId,
  });
  const attemptStatus = stateQuery.data?.status;
  // A finished attempt with nothing open → the "completed" screen; content
  // is only needed once an attempt is (or is about to be) running.
  const needsContent = attemptStatus === 'not_started' || attemptStatus === 'in_progress';

  const contentQuery = useQuery({
    queryKey: ['asturContent', assessmentId, stateQuery.data?.active_run?.run_id ?? null, locale] as const,
    queryFn: () => asturApi.getContent(assessmentId),
    enabled: !!assessmentId && needsContent,
    // Logical-schema concepts are shuffled per request — refetching mid-attempt
    // would reshuffle a subtest under the respondent's hands.
    staleTime: Infinity,
  });
  const content = contentQuery.data;

  // Whether a finished result already existed when this screen opened — the
  // attempt running here is then a retake, and finishing it goes back to the
  // results instead of generating the report again.
  // Judged once, on the first state load — the first attempt finishing in
  // this session must not turn itself into a "retake".
  const [isRetake, setIsRetake] = useState<boolean | null>(null);
  useEffect(() => {
    if (stateQuery.data && isRetake === null) setIsRetake(!!stateQuery.data.latest_completed_run);
  }, [stateQuery.data, isRetake]);

  const [justSubmitted, setJustSubmitted] = useState<Set<AsturSubtestKey>>(new Set());
  const [finished, setFinished] = useState(false);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [retakeConfirmOpen, setRetakeConfirmOpen] = useState(false);
  const [retaking, setRetaking] = useState(false);

  const submitted = useMemo(() => {
    const fromServer = stateQuery.data?.active_run?.submitted_subtests ?? [];
    return new Set<AsturSubtestKey>([...fromServer, ...justSubmitted]);
  }, [stateQuery.data?.active_run?.submitted_subtests, justSubmitted]);

  const subtests = content?.subtests ?? [];
  const subtestIndex = subtests.findIndex((s) => !submitted.has(s.key));
  const subtestCount = subtests.length;
  const allDone = finished;
  const subtest = !finished && subtestIndex >= 0 ? subtests[subtestIndex] : null;
  const showCompleted = !finished && attemptStatus === 'completed';

  useEffect(() => {
    if (allDone) useAssessmentStore.getState().setAsturCompleted(true);
  }, [allDone]);

  function beginSubtest() {
    setStepPhase('running');
    if (subtest && subtest.key !== 'lability') {
      void asturApi.startSubtest(assessmentId, subtest.number).catch(() => {});
    }
  }

  async function submitOne(target: AsturContentSubtest, payload: SubmitAsturSubtestPayload) {
    const body = target.key === 'lability' ? { ...payload, client_timezone: clientTimezone() } : payload;
    const response = await asturApi.submitSubtest(assessmentId, target.number, body);
    setJustSubmitted((prev) => new Set(prev).add(target.key));
    if (response.run_completed) {
      setFinished(true);
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
    }
  }

  async function completeSubtest(payload: SubmitAsturSubtestPayload) {
    if (!subtest) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitOne(subtest, payload);
      setStepPhase('instruction');
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmRetake() {
    setRetaking(true);
    try {
      await asturApi.startRetake(assessmentId);
      setJustSubmitted(new Set());
      setFinished(false);
      setIsRetake(true);
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
      setRetakeConfirmOpen(false);
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setRetaking(false);
    }
  }

  async function handleAutofill() {
    if (!content || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const st of content.subtests.filter((s) => !submitted.has(s.key))) {
        const answers: Record<string, unknown> = {};
        const elapsed: Record<string, number> = {};
        st.items.forEach((item, i) => {
          answers[String(i + 1)] = asturAutofillAnswer(st.key, item as Record<string, unknown>);
          elapsed[String(i + 1)] = 1000;
        });
        await submitOne(st, st.key === 'lability' ? { answers, elapsed_ms: elapsed } : { answers });
      }
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  // Every subtest is on the server the moment it's submitted — leaving only
  // loses the subtest currently on screen.
  function handleExit() {
    setExitConfirmOpen(true);
  }

  function confirmExit() {
    setExitConfirmOpen(false);
    navigate('/results');
  }

  return {
    isLoading: stateQuery.isLoading || (needsContent && contentQuery.isLoading),
    loadError: stateQuery.isError || contentQuery.isError ? t('astur.loadError') : null,
    runId: stateQuery.data?.active_run?.run_id ?? null,
    completedAt: stateQuery.data?.latest_completed_run?.completed_at ?? null,
    showCompleted,
    isRetake: !!isRetake,
    subtest,
    subtestIndex: subtestIndex === -1 ? subtestCount : subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs: content?.lability_item_limit_ms ?? 20000,
    exitConfirmOpen,
    retakeConfirmOpen,
    retaking,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit: () => setExitConfirmOpen(false),
    openRetakeConfirm: () => setRetakeConfirmOpen(true),
    cancelRetake: () => setRetakeConfirmOpen(false),
    confirmRetake,
    submitting,
    submitError,
  };
}
