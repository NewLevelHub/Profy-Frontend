import { useQuery } from '@tanstack/react-query';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';

/** Reports of the psychologist's own students still waiting for review —
 *  the queue page and the "Проверка отчётов · N" counter in the psychologist navigation share
 *  one cache entry, so publishing a report updates both. */
export function usePsychologistReviews({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: psychologistKeys.reviews(),
    queryFn: psychologistApi.listReviews,
    enabled,
    staleTime: 30_000,
    // New reports arrive from students while the psychologist is elsewhere:
    // refresh the queue and its counter on return to the tab.
    refetchOnWindowFocus: true,
  });
}
