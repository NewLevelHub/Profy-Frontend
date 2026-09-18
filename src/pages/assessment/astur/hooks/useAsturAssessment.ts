import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { AsturSubtestKey, SubmitAsturSubtestPayload } from '@/shared/types';

type StepPhase = 'instruction' | 'running';

function storageKey(assessmentId: string) {
  return `profy-astur-completed:${assessmentId}`;
}

function restoreCompleted(assessmentId: string): Set<AsturSubtestKey> {
  try {
    const raw = sessionStorage.getItem(storageKey(assessmentId));
    return raw ? new Set(JSON.parse(raw) as AsturSubtestKey[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistCompleted(assessmentId: string, completed: Set<AsturSubtestKey>) {
  try {
    sessionStorage.setItem(storageKey(assessmentId), JSON.stringify([...completed]));
  } catch {
    // sessionStorage unavailable (private mode etc.) — progress just won't
    // survive a reload; the current tab session still works fine.
  }
}

/**
 * PRO-338 Ф3.6 — all data fetching/derived state for the АСТУР
 * multi-subtest flow. Part of the continuous assessment sequence.
 */
export function useAsturAssessment(assessmentId: string) {
  const navigate = useNavigate();
  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['asturContent'] as const,
    queryFn: asturApi.getContent,
  });

  const [completed, setCompleted] = useState<Set<AsturSubtestKey>>(() => restoreCompleted(assessmentId));
  const [subtestIndex, setSubtestIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  // Once content is known, resume at the first subtest not already in
  // `completed` — runs once per content load, not on every `completed` tick
  useEffect(() => {
    if (!content) return;
    const idx = content.subtests.findIndex(s => !completed.has(s.key));
    setSubtestIndex(idx === -1 ? content.subtests.length : idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const subtestCount = content?.subtests.length ?? 0;
  const allDone = content !== undefined && subtestIndex >= subtestCount && subtestCount > 0;
  const subtest = content && !allDone ? content.subtests[subtestIndex] : null;

  useEffect(() => {
    if (allDone) {
      useAssessmentStore.getState().setAsturCompleted(true);
    }
  }, [allDone]);

  function beginSubtest() {
    setStepPhase('running');
    if (subtest && subtest.key !== 'lability') {
      void asturApi.startSubtest(assessmentId, subtest.number).catch(() => {});
    }
  }

  async function completeSubtest(payload: SubmitAsturSubtestPayload) {
    if (!subtest) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await asturApi.submitSubtest(assessmentId, subtest.number, payload);
      setCompleted(prev => {
        const next = new Set(prev);
        next.add(subtest.key);
        persistCompleted(assessmentId, next);
        return next;
      });
      const nextIndex = subtestIndex + 1;
      setSubtestIndex(nextIndex);
      if (nextIndex >= subtestCount) {
        useAssessmentStore.getState().setAsturCompleted(true);
      }
      setStepPhase('instruction');
    } catch {
      setSubmitError('Не удалось отправить ответы, попробуйте ещё раз');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutofill() {
    if (!content || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const st of content.subtests) {
        if (!completed.has(st.key)) {
          const answers: Record<string, unknown> = {};
          st.items.forEach((it: any) => {
            if (st.key === 'logical_schemas') {
              answers[it.id] = (it.options || []).slice(0, 3);
            } else if (st.key === 'classification' || st.key === 'numeric_series') {
              answers[it.id] = [(it.options?.[0] ?? '1'), (it.options?.[1] ?? '2')];
            } else if (st.key === 'geometric_figures') {
              answers[it.id] = 'А';
            } else {
              answers[it.id] = it.options?.[0] ?? '1';
            }
          });
          await asturApi.submitSubtest(assessmentId, st.number, { answers, elapsed_ms: {} });
          setCompleted(prev => {
            const next = new Set(prev);
            next.add(st.key);
            persistCompleted(assessmentId, next);
            return next;
          });
        }
      }
      setSubtestIndex(content.subtests.length);
      useAssessmentStore.getState().setAsturCompleted(true);
    } catch {
      setSubmitError('Не удалось автозаполнить субтесты');
    } finally {
      setSubmitting(false);
    }
  }

  // Each subtest is already submitted to the server the moment it's
  // completed (completeSubtest above), and `completed` is mirrored into
  // sessionStorage — so exiting mid-test needs no extra flush, just leave.
  // Only the in-progress (not-yet-submitted) subtest's answers are lost,
  // matching how a Likert page's unsent answers are only flushed on exit —
  // here the flush already happened at each subtest boundary instead.
  function handleExit() {
    setExitConfirmOpen(true);
  }

  function confirmExit() {
    setExitConfirmOpen(false);
    navigate('/results');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  return {
    isLoading,
    loadError: isError ? 'Не удалось загрузить содержимое теста' : null,
    subtest,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs: content?.lability_item_limit_ms ?? 5000,
    exitConfirmOpen,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    submitting,
    submitError,
  };
}
