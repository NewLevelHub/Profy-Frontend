import { useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
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
import type { CountdownClockSync } from './useCountdown';

type StepPhase = 'instruction' | 'running';
type SubtestSubmit = Omit<SubmitAsturSubtestPayload, 'run_id'>;

const asturStateQueryKey = (assessmentId: string) => ['asturState', assessmentId] as const;
const asturAttemptQueryKey = (assessmentId: string) => ['asturAttempt', assessmentId] as const;

function captureServerClock(serverNow: string): CountdownClockSync {
  return {
    serverNow,
    monotonicAtMs: typeof performance === 'undefined' ? 0 : performance.now(),
  };
}

type RecoveredMutation<T> =
  | { response: T; state: null }
  | { response: null; state: AsturState };

interface UnloadResetSnapshot {
  assessmentId: string;
  subtestNumber: number;
  runId: string;
  stateVersion: number;
  startedAt: string | null;
}

interface AbandonedSubtestMarker extends UnloadResetSnapshot {
  recordedAt: number;
}

const ABANDONED_SUBTEST_PREFIX = 'profy-astur-abandoned:';

function abandonedSubtestKey(runId: string): string {
  return `${ABANDONED_SUBTEST_PREFIX}${runId}`;
}

function storeAbandonedSubtest(snapshot: UnloadResetSnapshot) {
  try {
    localStorage.setItem(abandonedSubtestKey(snapshot.runId), JSON.stringify({
      ...snapshot,
      recordedAt: Date.now(),
    } satisfies AbandonedSubtestMarker));
  } catch {
    // Storage is only the durable fallback; keepalive reset still runs.
  }
}

function readAbandonedSubtest(runId: string): AbandonedSubtestMarker | null {
  try {
    const raw = localStorage.getItem(abandonedSubtestKey(runId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AbandonedSubtestMarker>;
    if (
      typeof value.assessmentId !== 'string'
      || typeof value.subtestNumber !== 'number'
      || value.runId !== runId
      || typeof value.stateVersion !== 'number'
      || (value.startedAt !== null && typeof value.startedAt !== 'string')
      || typeof value.recordedAt !== 'number'
    ) {
      localStorage.removeItem(abandonedSubtestKey(runId));
      return null;
    }
    return value as AbandonedSubtestMarker;
  } catch {
    return null;
  }
}

function clearAbandonedSubtest(runId: string) {
  try {
    localStorage.removeItem(abandonedSubtestKey(runId));
  } catch {
    // Private browsing may make storage unavailable.
  }
}

/** No response (or a gateway/server failure) cannot tell us whether the
 * mutation reached the backend and committed before the connection failed. */
function isAmbiguousMutationFailure(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === undefined || status === 408 || status >= 500;
}

function matchingRun(state: AsturState, runId: string): AsturRunSummary | null {
  if (state.active_run?.run_id === runId) return state.active_run;
  if (state.latest_completed_run?.run_id === runId) return state.latest_completed_run;
  return null;
}

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

function withReset(run: AsturRunSummary, key: AsturSubtestKey, stateVersion: number): AsturRunSummary {
  const started = { ...run.subtest_started_at };
  delete started[key];
  return {
    ...run,
    submitted_subtests: run.submitted_subtests.filter((submittedKey) => submittedKey !== key),
    subtest_started_at: started,
    state_version: stateVersion,
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
    // Opening is idempotent. A second request recovers the content when the
    // first one committed but its response was lost (PROFY-014).
    retry: (failureCount, error) => failureCount < 1 && isAmbiguousMutationFailure(error),
  });
  const stateClockSync = useMemo(
    () => stateQuery.data?.server_now ? captureServerClock(stateQuery.data.server_now) : null,
    [stateQuery.data?.server_now],
  );
  const attempt = attemptQuery.data;
  // Completed state does not reopen the attempt endpoint, so use the state
  // summaries as a fallback. Besides rendering completion, this lets us
  // remove an unload marker whose submit finished while the page was gone.
  const runId = attempt?.run.run_id
    ?? stateQuery.data?.active_run?.run_id
    ?? stateQuery.data?.latest_completed_run?.run_id
    ?? null;
  const content = attempt?.content;

  const [justSubmitted, setJustSubmitted] = useState<Set<AsturSubtestKey>>(new Set());
  const [finished, setFinished] = useState(false);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localStartedAt, setLocalStartedAt] = useState<Partial<Record<AsturSubtestKey, string>>>({});
  const [localClockSync, setLocalClockSync] = useState<Partial<Record<AsturSubtestKey, CountdownClockSync>>>({});
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState<string | null>(null);
  const [recoveringAbandonedSubtest, setRecoveringAbandonedSubtest] = useState(false);
  const [recoveryError, setRecoveryError] = useState(false);
  const [pageRestoreEpoch, setPageRestoreEpoch] = useState(0);
  const exitingRef = useRef(false);
  const recoveredPageScopeRef = useRef<string | null>(null);
  const allowNavigationRef = useRef(false);
  const unloadStateRef = useRef<{ shouldWarn: boolean; reset: UnloadResetSnapshot | null }>({
    shouldWarn: false,
    reset: null,
  });

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
  const runStateVersion = progressRun?.state_version ?? 0;
  const showCompleted = !finished && attemptStatus === 'completed';
  const locallyStartedAt = subtest ? localStartedAt[subtest.key] ?? null : null;
  const locallyCapturedClock = subtest ? localClockSync[subtest.key] ?? null : null;
  const subtestServerClock = locallyCapturedClock
    && (!stateClockSync || locallyCapturedClock.monotonicAtMs >= stateClockSync.monotonicAtMs)
    ? locallyCapturedClock
    : stateClockSync;
  const abandonedMarker = runId ? readAbandonedSubtest(runId) : null;
  const serverStartedAt = subtest ? progressRun?.subtest_started_at?.[subtest.key] ?? null : null;
  const pendingAbandonedRecovery = !!abandonedMarker
    && !!subtest
    && abandonedMarker.assessmentId === assessmentId
    && abandonedMarker.subtestNumber === subtest.number
    && abandonedMarker.stateVersion === runStateVersion
    && (abandonedMarker.startedAt === null || abandonedMarker.startedAt === serverStartedAt);
  const waitingForAbandonedRecovery = pendingAbandonedRecovery && !recoveryError;
  const shouldBlockNavigation = !!runId
    && !!subtest
    && !finished
    && !showCompleted
    && !waitingForAbandonedRecovery;
  const navigationBlocker = useBlocker(({ currentLocation, nextLocation }) =>
    !allowNavigationRef.current
      && shouldBlockNavigation
      && currentLocation.pathname !== nextLocation.pathname,
  );

  unloadStateRef.current = {
    shouldWarn: !!runId && !!subtest && (starting || submitting || !!subtestStartedAt),
    // Submit and reset are serialized by the backend row lock. If submit
    // wins, recovery observes the completed subtest; if reset wins, the
    // submit's started_at generation is rejected. Therefore a browser exit
    // during an in-flight submit must still leave a durable reset marker.
    // A passive second tab does not own the timer and creates no marker until
    // it actually starts or submits this subtest.
    reset: runId && subtest && (starting || submitting || !!locallyStartedAt)
      ? {
          assessmentId,
          subtestNumber: subtest.number,
          runId,
          stateVersion: runStateVersion,
          startedAt: locallyStartedAt ?? subtestStartedAt,
        }
      : null,
  };

  useEffect(() => {
    if (navigationBlocker.state !== 'blocked') return;
    setExitError(null);
    setExitConfirmOpen(true);
  }, [navigationBlocker.state]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!unloadStateRef.current.shouldWarn) return;
      event.preventDefault();
      event.returnValue = '';
    }

    function handlePageHide() {
      const snapshot = unloadStateRef.current.reset;
      if (!snapshot) return;
      storeAbandonedSubtest(snapshot);
      asturApi.resetSubtestOnUnload(
        snapshot.assessmentId,
        snapshot.subtestNumber,
        snapshot.runId,
        snapshot.stateVersion,
      );
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      // A page restored from the back-forward cache did not remount. Re-run
      // the same abandoned-subtest reconciliation before showing its runner.
      recoveredPageScopeRef.current = null;
      setPageRestoreEpoch((current) => current + 1);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // A server-owned live section (for example, another tab) resumes from its
  // original `/start`. A timer marked abandoned by this document is removed
  // by the recovery effect below before the runner can render.
  useEffect(() => {
    if (!subtest) return;
    setStepPhase(subtestStartedAt ? 'running' : 'instruction');
  }, [runId, subtest?.key, subtestStartedAt]);

  useEffect(() => {
    if (finished) useAssessmentStore.getState().setAsturCompleted(true);
  }, [finished]);

  async function refreshServerState(): Promise<AsturState> {
    const state = await asturApi.getState(assessmentId);
    queryClient.setQueryData<AsturState>(asturStateQueryKey(assessmentId), state);
    return state;
  }

  /**
   * Recover an ambiguous mutation without making the UI guess. Do not
   * automatically repeat start/reset here: that could race an exit or a new
   * start from another tab (PROFY-015). If the server has not applied the
   * operation, the existing UI leaves the explicit retry to the student.
   */
  async function runRecoverableMutation<T>(
    request: () => Promise<T>,
    wasApplied: (state: AsturState) => boolean,
    reconcileConflict = false,
  ): Promise<RecoveredMutation<T>> {
    try {
      return { response: await request(), state: null };
    } catch (initialError) {
      const isConflict = isAxiosError(initialError) && initialError.response?.status === 409;
      if (!isAmbiguousMutationFailure(initialError) && !(reconcileConflict && isConflict)) {
        throw initialError;
      }

      try {
        const state = await refreshServerState();
        if (wasApplied(state)) return { response: null, state };
      } catch {
        // The state request may fail on the same broken connection. Preserve
        // the mutation error for the existing localized retry UI.
      }
      throw initialError;
    }
  }

  function applySubmitted(key: AsturSubtestKey, runCompleted: boolean) {
    setJustSubmitted((prev) => new Set(prev).add(key));
    setLocalClockSync((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    queryClient.setQueryData<AsturAttempt>(asturAttemptQueryKey(assessmentId), (current) =>
      current ? { ...current, run: withSubmitted(current.run, key) } : current,
    );
    queryClient.setQueryData<AsturState>(asturStateQueryKey(assessmentId), (current) =>
      current?.active_run?.run_id === runId
        ? { ...current, active_run: withSubmitted(current.active_run, key) }
        : current,
    );
    if (runCompleted) setFinished(true);
  }

  function applyReset(key: AsturSubtestKey, stateVersion: number, updateRunCaches: boolean) {
    setJustSubmitted((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setLocalStartedAt((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setLocalClockSync((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (updateRunCaches) {
      queryClient.setQueryData<AsturAttempt>(asturAttemptQueryKey(assessmentId), (current) =>
        current ? { ...current, run: withReset(current.run, key, stateVersion) } : current,
      );
      queryClient.setQueryData<AsturState>(asturStateQueryKey(assessmentId), (current) =>
        current?.active_run?.run_id === runId
          ? { ...current, active_run: withReset(current.active_run, key, stateVersion) }
          : current,
      );
    }
  }

  function applyResetOutcome(
    key: AsturSubtestKey,
    operationVersion: number,
    outcome: RecoveredMutation<Awaited<ReturnType<typeof asturApi.resetSubtest>>>,
  ) {
    const nextVersion = outcome.response?.state_version
      ?? matchingRun(outcome.state!, runId!)?.state_version
      ?? operationVersion + 1;
    // A reconciled state may already contain a newer start from another
    // tab. Keep that authoritative cache intact; only clear this screen's
    // local draft.
    applyReset(key, nextVersion, !outcome.state);
    if (runId) clearAbandonedSubtest(runId);
    if (!outcome.state) {
      // The reset response is definitive. Refresh only in the background;
      // a failed follow-up GET must not turn a successful reset into an error.
      void queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
    }
  }

  // pagehide records only a timer started by this document. On the next mount
  // (or a bfcache restore) reconcile that durable marker with the server. This
  // avoids both relying on the unload request and resetting another live tab.
  useEffect(() => {
    if (!stateQuery.isSuccess || (needsAttempt && !attemptQuery.isSuccess) || !runId) return;
    const pageScope = `${assessmentId}:${runId}:${pageRestoreEpoch}`;
    if (recoveredPageScopeRef.current === pageScope) return;
    recoveredPageScopeRef.current = pageScope;

    const marker = abandonedMarker;
    if (!marker) return;
    // A submit may have completed the run while the document was closing.
    // There is then nothing left to reset, but the durable marker must not
    // survive forever in localStorage.
    if (!subtest) {
      clearAbandonedSubtest(runId);
      return;
    }
    const sameTarget = marker.assessmentId === assessmentId && marker.subtestNumber === subtest.number;
    const sameGeneration = marker.stateVersion === runStateVersion;
    const sameStart = marker.startedAt === null || marker.startedAt === serverStartedAt;
    if (!sameTarget || !sameGeneration || !sameStart) {
      clearAbandonedSubtest(runId);
      return;
    }

    const target = subtest;
    const operationVersion = marker.stateVersion;
    setRecoveringAbandonedSubtest(true);
    setRecoveryError(false);
    void (async () => {
      let resetError: unknown = null;
      try {
        await asturApi.resetSubtest(assessmentId, target.number, runId, operationVersion);
      } catch (error) {
        resetError = error;
      }

      try {
        // Always reconcile after an unload reset. A stale reset is an
        // intentional no-op and must not erase a newer timer from another tab.
        const state = await refreshServerState();
        const run = matchingRun(state, runId);
        const resetApplied = !run
          || run.state_version > operationVersion
          || run.submitted_subtests.includes(target.key);
        if (!resetApplied) throw resetError ?? new Error('astur_abandoned_reset_not_applied');
        clearAbandonedSubtest(runId);
        applyReset(target.key, run?.state_version ?? operationVersion + 1, false);
      } catch {
        setRecoveryError(true);
      } finally {
        setRecoveringAbandonedSubtest(false);
      }
    })();
    // Deliberately keyed to the first complete server snapshot for this run.
    // Refetches during the live page must not reclassify its own timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, runId, stateQuery.isSuccess, attemptQuery.isSuccess, needsAttempt, pageRestoreEpoch]);

  /** The subtest opens only after the server has recorded its start — its
   *  timing is the server's, and a failed start never shows the items. */
  async function beginSubtest() {
    if (!subtest || !runId || starting || exitingRef.current) return;
    setStarting(true);
    setSubmitError(null);
    try {
      const target = subtest;
      const operationVersion = runStateVersion;
      const outcome = await runRecoverableMutation(
        () => asturApi.startSubtest(assessmentId, target.number, runId, operationVersion),
        (state) => {
          const run = matchingRun(state, runId);
          return !!run && (run.submitted_subtests.includes(target.key) || !!run.subtest_started_at[target.key]);
        },
      );
      const reconciledRun = outcome.state ? matchingRun(outcome.state, runId) : null;
      if (reconciledRun?.submitted_subtests.includes(target.key)) {
        const runCompleted = outcome.state?.status === 'completed';
        applySubmitted(target.key, runCompleted);
        setStepPhase('instruction');
      } else {
        const startedAt = outcome.response?.started_at ?? reconciledRun?.subtest_started_at[target.key];
        const serverNow = outcome.response?.server_now ?? outcome.state?.server_now;
        if (!startedAt || !serverNow) throw new Error('astur_start_state_missing');
        setLocalStartedAt((prev) => ({ ...prev, [target.key]: startedAt }));
        setLocalClockSync((prev) => ({ ...prev, [target.key]: captureServerClock(serverNow) }));
        setStepPhase('running');
      }
    } catch {
      if (!exitingRef.current) setSubmitError(t('astur.startError'));
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
    const outcome = await runRecoverableMutation(
      () => asturApi.submitSubtest(assessmentId, target.number, body),
      (state) => !!matchingRun(state, runId)?.submitted_subtests.includes(target.key),
    );
    const runCompleted = outcome.response?.run_completed
      ?? (outcome.state?.status === 'completed' && outcome.state.latest_completed_run?.run_id === runId);
    applySubmitted(target.key, runCompleted);
    if (runCompleted && !outcome.state) {
      // Local completion is enough to advance immediately; refresh the
      // completed timestamp/snapshot in the background and never turn a
      // successful submit into a visible error because this GET failed.
      void queryClient.invalidateQueries({ queryKey: asturStateQueryKey(assessmentId) });
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
        const started = await asturApi.startSubtest(assessmentId, st.number, runId, runStateVersion);
        await submitOne(st, asturAutofillPayload(st), started.started_at);
      }
    } catch {
      setSubmitError(t('astur.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmExit() {
    if (exitingRef.current || starting || submitting || recoveringAbandonedSubtest) return;
    if (!subtest || !runId) {
      allowNavigationRef.current = true;
      if (navigationBlocker.state === 'blocked') navigationBlocker.proceed();
      else navigate('/results');
      return;
    }

    exitingRef.current = true;
    setExiting(true);
    setExitError(null);
    try {
      const target = subtest;
      const operationVersion = runStateVersion;
      const outcome = await runRecoverableMutation(
        () => asturApi.resetSubtest(assessmentId, target.number, runId, operationVersion),
        (state) => {
          const run = matchingRun(state, runId);
          return !run
            || run.state_version > operationVersion
            || run.submitted_subtests.includes(target.key);
        },
        true,
      );
      applyResetOutcome(target.key, operationVersion, outcome);
      // React state updates above are asynchronous. Clear the imperative
      // pagehide snapshot before navigation so this successful reset is not
      // immediately followed by a duplicate keepalive reset and a stale
      // localStorage recovery marker.
      unloadStateRef.current = { shouldWarn: false, reset: null };
      setExitConfirmOpen(false);
      allowNavigationRef.current = true;
      if (navigationBlocker.state === 'blocked') navigationBlocker.proceed();
      else navigate('/results');
    } catch {
      exitingRef.current = false;
      setExiting(false);
      setExitError(t('astur.exit.resetError'));
    }
  }

  return {
    isLoading: stateQuery.isLoading
      || (needsAttempt && attemptQuery.isLoading)
      || recoveringAbandonedSubtest
      || waitingForAbandonedRecovery,
    loadError: stateQuery.isError || attemptQuery.isError || recoveryError ? t('astur.loadError') : null,
    runId,
    completedAt: stateQuery.data?.latest_completed_run?.completed_at ?? null,
    showCompleted,
    subtest,
    subtestStartedAt,
    subtestServerClock,
    subtestIndex: subtestIndex === -1 ? subtestCount : subtestIndex,
    subtestCount,
    stepPhase,
    allDone: finished,
    labilityItemLimitMs,
    maxMinutes: asturMaxMinutes(subtests, labilityItemLimitMs),
    exitConfirmOpen,
    exiting: exiting || starting || submitting || recoveringAbandonedSubtest,
    exitError,
    starting,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    // Every subtest is on the server the moment it's submitted — leaving
    // only loses the subtest currently on screen.
    handleExit: () => {
      if (starting || submitting) return;
      setExitError(null);
      setExitConfirmOpen(true);
    },
    confirmExit,
    cancelExit: () => {
      if (exitingRef.current) return;
      setExitError(null);
      setExitConfirmOpen(false);
      if (navigationBlocker.state === 'blocked') navigationBlocker.reset();
    },
    submitting,
    submitError,
  };
}
