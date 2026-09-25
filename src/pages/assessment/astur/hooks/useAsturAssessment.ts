import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import { asturAutofillPayload } from '@/shared/dev/autofillAssessment';
import type { AsturContentSubtest, AsturSubtestKey, SubmitAsturSubtestPayload } from '@/shared/types';

type StepPhase = 'instruction' | 'running';
type SubtestSubmit = Omit<SubmitAsturSubtestPayload, 'run_id'>;

export const asturStateQueryKey = (assessmentId: string) => ['asturState', assessmentId] as const;
export const asturAttemptQueryKey = (assessmentId: string) => ['asturAttempt', assessmentId] as const;

function clientTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

/**
 * АСТУР attempt flow (PRO-338 Ф3.6, lifecycle PRO-427). The attempt is
 * opened first and its content comes back in the same response, pinned to
 * the attempt's bank version and language — items are never shown before
 * the attempt that scores them exists, and switching the app language
 * mid-attempt doesn't swap them. Every start/submit names the attempt
 * (`run_id`). Progress comes from the server (`submitted_subtests`), so a
 * reload or another device resumes exactly where the attempt stands. A
 * finished attempt is never extended — «Пройти заново» opens a new one.
 */
export function useAsturAssessment(assessmentId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('assessment');

  const stateQuery = useQuery({
    queryKey: asturStateQueryKey(assessmentId),
    queryFn: () => asturApi.getState(assessmentId),
    enabled: !!assessmentId,
  });
  const attemptStatus = stateQuery.data?.status;
  const needsAttempt = attemptStatus === 'not_started' || attemptStatus === 'in_progress';

  const attemptQuery = useQuery({
    // No locale in the key: the attempt's language is its own.
    queryKey: asturAttemptQueryKey(assessmentId),
    queryFn: () => asturApi.openAttempt(assessmentId),
    enabled: !!assessmentId && needsAttempt,
    // Logical-schema concepts are shuffled per request — refetching
    // mid-attempt would reshuffle a subtest under the respondent's hands.
    staleTime: Infinity,
    retry: false,
  });
  const attempt = attemptQuery.data;
  const runId = attempt?.run.run_id ?? null;
  const content = attempt?.content;

  // Judged once, on the first state load — the first attempt finishing in
  // this session must not turn itself into a "retake".
  const [isRetake, setIsRetake] = useState<boolean | null>(null);
  useEffect(() => {
    if (stateQuery.data && isRetake === null) setIsRetake(!!stateQuery.data.latest_completed_run);
  }, [stateQuery.data, isRetake]);

  const [justSubmitted, setJustSubmitted] = useState<Set<AsturSubtestKey>>(new Set());
  const [finished, setFinished] = useState(false);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localStartedAt, setLocalStartedAt] = useState<Partial<Record<AsturSubtestKey, string>>>({});
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [retakeConfirmOpen, setRetakeConfirmOpen] = useState(false);
  const [retaking, setRetaking] = useState(false);

  const submitted = useMemo(
    () => new Set<AsturSubtestKey>([...(attempt?.run.submitted_subtests ?? []), ...justSubmitted]),
    [attempt?.run.submitted_subtests, justSubmitted],
  );

  const subtests = content?.subtests ?? [];
  const subtestIndex = subtests.findIndex((s) => !submitted.has(s.key));
  const subtestCount = subtests.length;
  const subtest = !finished && subtestIndex >= 0 ? subtests[subtestIndex] : null;
  const subtestStartedAt = subtest
    ? localStartedAt[subtest.key] ?? attempt?.run.subtest_started_at?.[subtest.key] ?? null
    : null;
  const showCompleted = !finished && attemptStatus === 'completed';

  // A reload resumes an already-started section immediately. Its countdown
  // remains anchored to the first server `/start`, never to this render.
  useEffect(() => {
    if (!subtest) return;
    setStepPhase(subtestStartedAt ? 'running' : 'instruction');
  }, [runId, subtest?.key, subtestStartedAt]);

  useEffect(() => {
    if (finished) useAssessmentStore.getState().setAsturCompleted(true);
  }, [finished]);

  /** The subtest opens only after the server has recorded its start — its
   *  timing is the server's, and a failed start never shows the items. */
  async function beginSubtest() {
    if (!subtest || !runId) return;
    setStarting(true);
    setSubmitError(null);
    try {
      const started = await asturApi.startSubtest(assessmentId, subtest.number, runId);
      setLocalStartedAt((prev) => ({ ...prev, [subtest.key]: started.started_at }));
      setStepPhase('running');
    } catch {
      setSubmitError(t('astur.startError'));
    } finally {
      setStarting(false);
    }
  }

  async function submitOne(target: AsturContentSubtest, payload: SubtestSubmit) {
    if (!runId) return;
    const body: SubmitAsturSubtestPayload = {
      ...payload,
      run_id: runId,
      ...(target.key === 'lability' ? { client_timezone: clientTimezone() } : {}),
    };
    const response = await asturApi.submitSubtest(assessmentId, target.number, body);
    setJustSubmitted((prev) => new Set(prev).add(target.key));
    if (response.run_completed) {
      setFinished(true);
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
    }
  }

  async function completeSubtest(payload: SubtestSubmit) {
    if (!subtest || submitting) return;
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
      const opened = await asturApi.openAttempt(assessmentId, true);
      queryClient.setQueryData(asturAttemptQueryKey(assessmentId), opened);
      setJustSubmitted(new Set());
      setLocalStartedAt({});
      setFinished(false);
      setIsRetake(true);
      setStepPhase('instruction');
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
      setRetakeConfirmOpen(false);
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setRetaking(false);
    }
  }

  async function handleAutofill() {
    if (!content || !runId || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const st of content.subtests.filter((s) => !submitted.has(s.key))) {
        await asturApi.startSubtest(assessmentId, st.number, runId);
        await submitOne(st, asturAutofillPayload(st));
      }
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  return {
    isLoading: stateQuery.isLoading || (needsAttempt && attemptQuery.isLoading),
    loadError: stateQuery.isError || attemptQuery.isError ? t('astur.loadError') : null,
    runId,
    completedAt: stateQuery.data?.latest_completed_run?.completed_at ?? null,
    showCompleted,
    isRetake: !!isRetake,
    subtest,
    subtestStartedAt,
    subtestIndex: subtestIndex === -1 ? subtestCount : subtestIndex,
    subtestCount,
    stepPhase,
    allDone: finished,
    labilityItemLimitMs: content?.lability_item_limit_ms ?? 20000,
    exitConfirmOpen,
    retakeConfirmOpen,
    retaking,
    starting,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    // Every subtest is on the server the moment it's submitted — leaving
    // only loses the subtest currently on screen.
    handleExit: () => setExitConfirmOpen(true),
    confirmExit: () => {
      setExitConfirmOpen(false);
      navigate('/results');
    },
    cancelExit: () => setExitConfirmOpen(false),
    openRetakeConfirm: () => setRetakeConfirmOpen(true),
    cancelRetake: () => setRetakeConfirmOpen(false),
    confirmRetake,
    submitting,
    submitError,
  };
}
