import { useQuery } from '@tanstack/react-query';
import { extendedBlocksApi } from '@/shared/api/extendedBlocks';

/**
 * Post-Ф4.1 follow-up — the student's own view of Belbin/АСТУР assignments
 * (replaces the hand-delivered link Ф2.6/Ф3.6 originally shipped with:
 * the psychologist "назначает", the student discovers it here, on their
 * own /results, not via a URL someone sends them).
 */
export function useExtendedBlocks(assessmentId: string | null | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['extendedBlocks', assessmentId] as const,
    queryFn: () => extendedBlocksApi.list(assessmentId!),
    enabled: !!assessmentId,
  });

  const assignments = data?.assignments ?? [];
  const pending = assignments.filter((a) => !a.completed);

  return { assignments, pending, isLoading };
}
