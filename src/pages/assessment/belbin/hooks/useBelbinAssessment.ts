import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { belbinApi } from '@/shared/api/belbin';
import { useAssessmentStore } from '@/shared/store/assessment';

type Phase = 'intro' | 'block' | 'done';

function zeroAllocation(items: { id: string }[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, 0]));
}

/**
 * PRO-338 Ф2.6 — Belbin BTRSPI point-allocation flow.
 * Part of the continuous assessment sequence (RIASEC -> BigFive -> Motivation -> Belbin -> ASTUR).
 */
export function useBelbinAssessment(assessmentId: string) {
  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['belbinContent'] as const,
    queryFn: belbinApi.getContent,
  });

  const [phase, setPhase] = useState<Phase>('intro');
  const [blockIndex, setBlockIndex] = useState(0);
  const [allocations, setAllocations] = useState<Record<string, number>[]>([]);

  // Zero-filled once, the moment content arrives — every block starts at 0
  // across all 8 items, matching PointAllocator's own value/onChange
  // contract (Ф0.7: it never invents its own "nothing chosen" state).
  useEffect(() => {
    if (content && allocations.length === 0) {
      setAllocations(content.sections.map((section) => zeroAllocation(section.items)));
    }
  }, [content, allocations.length]);

  const submitMutation = useMutation({
    mutationFn: () => belbinApi.submit(assessmentId, { allocations }),
    onSuccess: () => {
      useAssessmentStore.getState().setBelbinCompleted(true);
      setPhase('done');
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
      useAssessmentStore.getState().setBelbinCompleted(true);
      setPhase('done');
    } catch {
      // ignore
    }
  }

  return {
    isLoading,
    loadError: isError ? 'Не удалось загрузить содержимое теста' : null,
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
    setAllocationValue,
    start,
    goBack,
    goNext,
    handleAutofill,
    submitting: submitMutation.isPending,
    submitError: submitMutation.isError ? 'Не удалось отправить ответы, попробуйте ещё раз' : null,
  };
}
