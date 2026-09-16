import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asturApi } from '@/shared/api/astur';
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
 * multi-subtest flow (Frontend-arch.md: page = assembly, hook = logic).
 *
 * Progress across a dropped connection/reload (Ф3.6's own requirement,
 * "обрыв на середине не теряет прогресс по сданным субтестам"): the
 * backend already guarantees this at the data level (Ф3.4's per-subtest
 * submit, one row built up incrementally) — this hook adds the missing
 * frontend half, since there is no GET-status endpoint to ask the server
 * "which subtests are already done" (astur.py only has start/submit).
 * Completed subtest keys are mirrored into sessionStorage; on mount, the
 * flow jumps straight to the first not-yet-completed subtest instead of
 * replaying finished ones.
 */
export function useAsturAssessment(assessmentId: string) {
  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['asturContent'] as const,
    queryFn: asturApi.getContent,
  });

  const [completed, setCompleted] = useState<Set<AsturSubtestKey>>(() => restoreCompleted(assessmentId));
  const [subtestIndex, setSubtestIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<StepPhase>('instruction');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Once content is known, resume at the first subtest not already in
  // `completed` — runs once per content load, not on every `completed` tick
  // (that would snap the index forward mid-flow after every submit, racing
  // the deliberate setSubtestIndex(i => i + 1) in completeSubtest below).
  useEffect(() => {
    if (!content) return;
    const idx = content.subtests.findIndex(s => !completed.has(s.key));
    setSubtestIndex(idx === -1 ? content.subtests.length : idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const subtestCount = content?.subtests.length ?? 0;
  const allDone = content !== undefined && subtestIndex >= subtestCount && subtestCount > 0;
  const subtest = content && !allDone ? content.subtests[subtestIndex] : null;

  function beginSubtest() {
    setStepPhase('running');
    if (subtest && subtest.key !== 'lability') {
      // Fire-and-forget: a failed /start just means this subtest's
      // actual_ms won't be server-verified (Ф3.4) — the answer is still
      // accepted, so a network blip here must never block the student.
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
      setSubtestIndex(i => i + 1);
      setStepPhase('instruction');
    } catch {
      setSubmitError('Не удалось отправить ответы, попробуйте ещё раз');
    } finally {
      setSubmitting(false);
    }
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
    beginSubtest,
    completeSubtest,
    submitting,
    submitError,
  };
}
