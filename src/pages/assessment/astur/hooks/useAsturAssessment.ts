import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import { asturAutofillPayload } from '@/shared/dev/autofillAssessment';
import type {
  AsturAttempt,
  AsturContentSubtest,
  AsturRunSummary,
  AsturState,
  AsturSubtestKey,
  SubmitAsturSubtestPayload,
} from '@/shared/types';
import { asturMaxMinutes } from '@/pages/assessment/astur/utils/asturDuration';

type StepPhase = 'instruction' | 'running';
type SubtestSubmit = Omit<SubmitAsturSubtestPayload, 'run_id'>;

const asturStateQueryKey = (assessmentId: string) => ['asturState', assessmentId] as const;
const asturAttemptQueryKey = (assessmentId: string) => ['asturAttempt', assessmentId] as const;

function clientTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

function withSubmitted(run: AsturRunSummary, key: AsturSubtestKey): AsturRunSummary {
  const started = { ...run.subtest_started_at };
  delete started[key];
  return {
    ...run,
    submitted_subtests: Array.from(new Set([...run.submitted_subtests, key])),
    subtest_started_at: started,
  };
}

function withReset(run: AsturRunSummary, key: AsturSubtestKey): AsturRunSummary {
  const started = { ...run.subtest_started_at };
  delete started[key];
  return {
    ...run,
    submitted_subtests: run.submitted_subtests.filter((submittedKey) => submittedKey !== key),
    subtest_started_at: started,
  };
}

/**
 * АСТУР attempt flow (PRO-338 Ф3.6, lifecycle PRO-427). The attempt is
 * opened first and its content comes back in the same response, pinned to
 * the attempt's bank version and language — items are never shown before
 * the attempt that scores them exists, and switching the app language
 * mid-attempt doesn't swap them. Every start/submit names the attempt
 * (`run_id`). Progress comes from the server (`submitted_subtests`), so a
 * reload or another device resumes exactly where the attempt stands. A
 * finished attempt is never extended or reopened.
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
    // The server shuffles options/words/concepts seeded by run and item
    // (PRO-441), so a refetch returns the same order — no need to refetch
    // the attempt's content once loaded.
    staleTime: Infinity,
    retry: false,
  });
  const attempt = attemptQuery.data;
  const runId = attempt?.run.run_id ?? null;
  const content = attempt?.content;

  const [justSubmitted, setJustSubmitted] = useState<Set<AsturSubtestKey>>(new Set());
  const [finished, setFinished] = useState(false);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localStartedAt, setLocalStartedAt] = useState<Partial<Record<AsturSubtestKey, string>>>({});
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const exitingRef = useRef(false);

  // `/state` is the live progress resource. `openAttempt` also carries a run
  // snapshot, but that query is cached forever because its shuffled content
  // is immutable; using its old submitted_subtests after remount used to send
  // the student back to the first subtest until a full page reload.
  const stateRun = stateQuery.data?.active_run;
  const progressRun = stateRun?.run_id === runId ? stateRun : attempt?.run;

  const submitted = useMemo(
    () => new Set<AsturSubtestKey>([...(progressRun?.submitted_subtests ?? []), ...justSubmitted]),
    [progressRun?.submitted_subtests, justSubmitted],
  );

  const subtests = content?.subtests ?? [];
  const subtestIndex = subtests.findIndex((s) => !submitted.has(s.key));
  const subtestCount = subtests.length;
  const subtest = !finished && subtestIndex >= 0 ? subtests[subtestIndex] : null;
  const labilityItemLimitMs = content?.lability_item_limit_ms ?? 20000;
  const subtestStartedAt = subtest
    ? localStartedAt[subtest.key] ?? progressRun?.subtest_started_at?.[subtest.key] ?? null
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
    if (!subtest || !runId || exitingRef.current) return;
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

  async function submitOne(target: AsturContentSubtest, payload: SubtestSubmit, startedAt?: string | null) {
    if (!runId) return;
    const body: SubmitAsturSubtestPayload = {
      ...payload,
      run_id: runId,
      ...(startedAt ? { started_at: startedAt } : {}),
      ...(target.key === 'lability' ? { client_timezone: clientTimezone() } : {}),
    };
    const response = await asturApi.submitSubtest(assessmentId, target.number, body);
    setJustSubmitted((prev) => new Set(prev).add(target.key));
    queryClient.setQueryData<AsturAttempt>(asturAttemptQueryKey(assessmentId), (current) =>
      current ? { ...current, run: withSubmitted(current.run, target.key) } : current,
    );
    queryClient.setQueryData<AsturState>(asturStateQueryKey(assessmentId), (current) =>
      current?.active_run?.run_id === runId
        ? { ...current, active_run: withSubmitted(current.active_run, target.key) }
        : current,
    );
    if (response.run_completed) {
      setFinished(true);
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
    }
  }

  async function completeSubtest(payload: SubtestSubmit) {
    if (!subtest || submitting || exitingRef.current) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitOne(subtest, payload, subtestStartedAt);
      setStepPhase('instruction');
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutofill() {
    if (!content || !runId || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const st of content.subtests.filter((s) => !submitted.has(s.key))) {
        const started = await asturApi.startSubtest(assessmentId, st.number, runId);
        await submitOne(st, asturAutofillPayload(st), started.started_at);
      }
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmExit() {
    if (exitingRef.current) return;
    if (!subtest || !runId) {
      navigate('/results');
      return;
    }

    exitingRef.current = true;
    setExiting(true);
    setExitError(null);
    try {
      await asturApi.resetSubtest(assessmentId, subtest.number, runId);
      setJustSubmitted((prev) => {
        const next = new Set(prev);
        next.delete(subtest.key);
        return next;
      });
      setLocalStartedAt((prev) => {
        const next = { ...prev };
        delete next[subtest.key];
        return next;
      });
      queryClient.setQueryData<AsturAttempt>(asturAttemptQueryKey(assessmentId), (current) =>
        current ? { ...current, run: withReset(current.run, subtest.key) } : current,
      );
      queryClient.setQueryData<AsturState>(asturStateQueryKey(assessmentId), (current) =>
        current?.active_run?.run_id === runId
          ? { ...current, active_run: withReset(current.active_run, subtest.key) }
          : current,
      );
      await queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
      setExitConfirmOpen(false);
      navigate('/results');
    } catch {
      exitingRef.current = false;
      setExiting(false);
      setExitError(t('astur.exit.resetError'));
    }
  }

  return {
    isLoading: stateQuery.isLoading || (needsAttempt && attemptQuery.isLoading),
    loadError: stateQuery.isError || attemptQuery.isError ? t('astur.loadError') : null,
    runId,
    completedAt: stateQuery.data?.latest_completed_run?.completed_at ?? null,
    showCompleted,
    subtest,
    subtestStartedAt,
    subtestIndex: subtestIndex === -1 ? subtestCount : subtestIndex,
    subtestCount,
    stepPhase,
    allDone: finished,
    labilityItemLimitMs,
    maxMinutes: asturMaxMinutes(subtests, labilityItemLimitMs),
    exitConfirmOpen,
    exiting,
    exitError,
    starting,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    // Every subtest is on the server the moment it's submitted — leaving
    // only loses the subtest currently on screen.
    handleExit: () => {
      setExitError(null);
      setExitConfirmOpen(true);
    },
    confirmExit,
    cancelExit: () => {
      if (exitingRef.current) return;
      setExitError(null);
      setExitConfirmOpen(false);
    },
    submitting,
    submitError,
  };
}
