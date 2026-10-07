import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { belbinApi } from '@/shared/api/belbin';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { BelbinProgressResponse } from '@/shared/types';
import { useAssessmentJourneyProgress } from '../../hooks/useAssessmentJourneyProgress';

type Phase = 'intro' | 'block' | 'done';

function zeroAllocation(items: { id: string }[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, 0]));
}

/**
 * PRO-338 Ф2.6 — Belbin BTRSPI point-allocation flow.
 * Part of the continuous assessment sequence (RIASEC -> BigFive -> Motivation -> Belbin -> ASTUR).
 */
export function useBelbinAssessment(assessmentId: string) {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const belbinCompleted = useAssessmentStore(s => s.belbinCompleted);
  const contentQuery = useQuery({
    queryKey: ['belbinContent'] as const,
    queryFn: belbinApi.getContent,
  });
  const progressKey = ['belbinProgress', assessmentId] as const;
  const progressQuery = useQuery({
    queryKey: progressKey,
    queryFn: () => belbinApi.getProgress(assessmentId),
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: Boolean(assessmentId),
    retry: false,
  });

  const content = contentQuery.data;
  const [phase, setPhase] = useState<Phase>('intro');
  const [blockIndex, setBlockIndex] = useState(0);
  const [allocations, setAllocations] = useState<Record<string, number>[]>([]);
  const [initializedAssessmentId, setInitializedAssessmentId] = useState<string | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [progressSaveError, setProgressSaveError] = useState(false);

  // Initialize only after a fresh server read. React Query may have cached
  // progress from an earlier mount; waiting for isFetching=false prevents a
  // stale empty cache from briefly winning over a newer block saved elsewhere.
  useEffect(() => {
    const serverProgress = progressQuery.data;
    if (
      !assessmentId
      || !content
      || !serverProgress
      || progressQuery.isFetching
      || initializedAssessmentId === assessmentId
    ) {
      return;
    }

    if (serverProgress.completed) {
      useAssessmentStore.getState().setBelbinCompleted(true);
      setPhase('done');
      setInitializedAssessmentId(assessmentId);
      return;
    }

    const restored = content.sections.map((section) => zeroAllocation(section.items));
    const completedIndexes = new Set<number>();
    for (const block of serverProgress.blocks) {
      if (block.block_index >= 0 && block.block_index < restored.length) {
        restored[block.block_index] = block.allocation;
        if (Object.values(block.allocation).reduce((sum, points) => sum + points, 0) === content.block_total) {
          completedIndexes.add(block.block_index);
        }
      }
    }
    const firstIncomplete = restored.findIndex((_, index) => !completedIndexes.has(index));
    setAllocations(restored);
    setBlockIndex(firstIncomplete === -1 ? Math.max(restored.length - 1, 0) : firstIncomplete);
    setPhase(serverProgress.blocks.length > 0 ? 'block' : 'intro');
    setInitializedAssessmentId(assessmentId);
  }, [assessmentId, content, initializedAssessmentId, progressQuery.data, progressQuery.isFetching]);

  function finish() {
    queryClient.setQueryData<BelbinProgressResponse>(progressKey, { completed: true, blocks: [] });
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

  const saveProgressMutation = useMutation({
    mutationFn: ({ index, value }: { index: number; value: Record<string, number> }) =>
      belbinApi.saveProgressBlock(assessmentId, index, value),
    onSuccess: (saved) => queryClient.setQueryData(progressKey, saved),
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
    setProgressSaveError(false);
    setAllocations((prev) => prev.map((block, i) => (i === blockIndex ? next : block)));
  }

  function start() {
    setPhase('block');
  }

  async function saveCurrentBlock(): Promise<boolean> {
    if (!section || initializedAssessmentId !== assessmentId) return true;
    setProgressSaveError(false);
    try {
      await saveProgressMutation.mutateAsync({ index: blockIndex, value: allocation });
      return true;
    } catch (err) {
      if (isAlreadyCompleted(err)) finish();
      else setProgressSaveError(true);
      return false;
    }
  }

  async function goBack() {
    if (!(await saveCurrentBlock())) return;
    if (blockIndex > 0) setBlockIndex((i) => i - 1);
    else setPhase('intro');
  }

  async function goNext() {
    if (!isBlockValid || saveProgressMutation.isPending || submitMutation.isPending) return;
    if (!(await saveCurrentBlock())) return;
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

  function handleExit() {
    setExitConfirmOpen(true);
  }

  async function confirmExit() {
    if (!(await saveCurrentBlock())) {
      setExitConfirmOpen(false);
      return;
    }
    setExitConfirmOpen(false);
    navigate('/results');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  return {
    isLoading:
      !contentQuery.isError
      && !progressQuery.isError
      && (
        contentQuery.isLoading
        || progressQuery.isLoading
        || progressQuery.isFetching
        || initializedAssessmentId !== assessmentId
      ),
    loadError: contentQuery.isError || progressQuery.isError ? t('belbin.loadError') : null,
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
    submitting: submitMutation.isPending || saveProgressMutation.isPending,
    submitError:
      progressSaveError
        ? t('belbin.progressSaveError')
        : submitMutation.isError && !isAlreadyCompleted(submitMutation.error)
          ? t('belbin.submitError')
          : null,
  };
}
