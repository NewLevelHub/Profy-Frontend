import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { belbinApi } from '@/shared/api/belbin';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useAssessmentJourneyProgress } from '../../hooks/useAssessmentJourneyProgress';

type Phase = 'intro' | 'block' | 'done';

interface StoredProgress {
  blockIndex: number;
  allocations: Record<string, number>[];
}

function zeroAllocation(items: { id: string }[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, 0]));
}

function progressKey(assessmentId: string) {
  return `profy-belbin-progress:${assessmentId}`;
}

// Belbin has no partial-submit endpoint on the server (unlike АСТУР's
// per-subtest submit) — everything reaches the backend in one call at the
// very end (goNext -> submitMutation). So "exit and keep progress" can only
// mean surviving in this tab's session: persist blockIndex/allocations to
// sessionStorage on every change and restore them on mount, the same way
// АСТУР's `persistCompleted`/`restoreCompleted` keep its subtest progress.
function restoreProgress(assessmentId: string): StoredProgress | null {
  try {
    const raw = sessionStorage.getItem(progressKey(assessmentId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return null;
  }
}

function persistProgress(assessmentId: string, progress: StoredProgress) {
  try {
    sessionStorage.setItem(progressKey(assessmentId), JSON.stringify(progress));
  } catch {
    // sessionStorage unavailable (private mode etc.) — progress just won't
    // survive a reload; the current tab session still works fine.
  }
}

function clearProgress(assessmentId: string) {
  try {
    sessionStorage.removeItem(progressKey(assessmentId));
  } catch {
    // ignore
  }
}

/**
 * PRO-338 Ф2.6 — Belbin BTRSPI point-allocation flow.
 * Part of the continuous assessment sequence (RIASEC -> BigFive -> Motivation -> Belbin -> ASTUR).
 */
export function useBelbinAssessment(assessmentId: string) {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const belbinCompleted = useAssessmentStore(s => s.belbinCompleted);
  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['belbinContent'] as const,
    queryFn: belbinApi.getContent,
  });

  const [restored] = useState(() => restoreProgress(assessmentId));
  const [phase, setPhase] = useState<Phase>(restored ? 'block' : 'intro');
  const [blockIndex, setBlockIndex] = useState(restored?.blockIndex ?? 0);
  const [allocations, setAllocations] = useState<Record<string, number>[]>(restored?.allocations ?? []);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  // Zero-filled once, the moment content arrives — every block starts at 0
  // across all 8 items, matching PointAllocator's own value/onChange
  // contract (Ф0.7: it never invents its own "nothing chosen" state). Skips
  // if a restored session already had allocations for this content.
  useEffect(() => {
    if (content && allocations.length === 0) {
      setAllocations(content.sections.map((section) => zeroAllocation(section.items)));
    }
  }, [content, allocations.length]);

  useEffect(() => {
    if (!assessmentId || allocations.length === 0) return;
    persistProgress(assessmentId, { blockIndex, allocations });
  }, [assessmentId, blockIndex, allocations]);

  function finish() {
    clearProgress(assessmentId);
    useAssessmentStore.getState().setBelbinCompleted(true);
    setPhase('done');
  }

  // One Belbin per assessment: 409 means it is already on the server (e.g.
  // submitted from another tab) — the same outcome as a fresh submit.
  function isAlreadyCompleted(err: unknown): boolean {
    return (err as AxiosError)?.response?.status === 409;
  }

  const submitMutation = useMutation({
    mutationFn: () => belbinApi.submit(assessmentId, { allocations }),
    onSuccess: finish,
    onError: (err) => {
      if (isAlreadyCompleted(err)) finish();
    },
  });

  const section = content?.sections[blockIndex] ?? null;
  const allocation = allocations[blockIndex] ?? {};
  const sum = Object.values(allocation).reduce((a, b) => a + b, 0);
  const blockTotal = content?.block_total ?? 10;
  // Server re-validates every block regardless (Ф0.6's validate_allocation) —
  // this gate is a UX nicety that blocks "Далее" early, never the source of truth.
  const isBlockValid = sum === blockTotal;
  const sectionCount = content?.sections.length ?? 0;
  const isLastBlock = sectionCount > 0 && blockIndex === sectionCount - 1;
  const belbinFraction =
    phase === 'done' || belbinCompleted
      ? 1
      : phase === 'intro' || sectionCount === 0
        ? 0
        : blockIndex / sectionCount;
  const progress = useAssessmentJourneyProgress({ belbinFraction });

  function setAllocationValue(next: Record<string, number>) {
    setAllocations((prev) => prev.map((block, i) => (i === blockIndex ? next : block)));
  }

  function start() {
    setPhase('block');
  }

  function goBack() {
    if (blockIndex > 0) setBlockIndex((i) => i - 1);
    else setPhase('intro');
  }

  function goNext() {
    if (!isBlockValid) return;
    if (isLastBlock) {
      submitMutation.mutate();
    } else {
      setBlockIndex((i) => i + 1);
    }
  }

  async function handleAutofill() {
    if (!content || submitMutation.isPending) return;
    const autofillAllocations = content.sections.map((sec) => {
      const alloc: Record<string, number> = {};
      sec.items.forEach((it, idx) => {
        alloc[it.id] = idx === 0 ? content.block_total : 0;
      });
      return alloc;
    });
    setAllocations(autofillAllocations);
    try {
      await belbinApi.submit(assessmentId, { allocations: autofillAllocations });
      finish();
    } catch (err) {
      if (isAlreadyCompleted(err)) finish();
    }
  }

  // Progress (blockIndex/allocations) is already flushed to sessionStorage
  // on every change above, so exiting needs no extra save step — just leave.
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
    loadError: isError ? t('belbin.loadError') : null,
    instruction: content?.instruction ?? '',
    phase,
    section,
    sectionIndex: blockIndex,
    sectionCount,
    allocation,
    blockTotal,
    sum,
    isBlockValid,
    isLastBlock,
    progress,
    exitConfirmOpen,
    setAllocationValue,
    start,
    goBack,
    goNext,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    submitting: submitMutation.isPending,
    submitError:
      submitMutation.isError && !isAlreadyCompleted(submitMutation.error) ? t('belbin.submitError') : null,
  };
}
