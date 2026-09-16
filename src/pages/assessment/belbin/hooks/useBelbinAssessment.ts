import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { belbinApi } from '@/shared/api/belbin';

type Phase = 'intro' | 'block' | 'done';

function zeroAllocation(items: { id: string }[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, 0]));
}

/**
 * PRO-338 Ф2.6 — all data fetching/derived state for the Belbin
 * point-allocation flow lives here (Frontend-arch.md: page = assembly,
 * hook = logic). Separate from `useAssessment`/`usePairAssessment`: this is
 * a standalone, opt-in block (launched from the psychologist cabinet, own
 * route outside `/assessment`), not another step of the main battery — no
 * shared progress store, no exit-modal/autofill machinery from that flow.
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
    onSuccess: () => setPhase('done'),
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
    submitting: submitMutation.isPending,
    submitError: submitMutation.isError ? 'Не удалось отправить ответы, попробуйте ещё раз' : null,
  };
}
