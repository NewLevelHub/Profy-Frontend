import { useQuery } from '@tanstack/react-query';
import { psychologistApi } from '@/shared/api/psychologist';
import { psychologistKeys } from '@/shared/api/psychologistKeys';

/** Reports of the psychologist's own students still waiting for review —
 *  the «Мои ученики · N» counter in the psychologist navigation; publishing
 *  a report updates it through this one cache entry. */
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
