import { useQuery } from '@tanstack/react-query';
import { directionsApi } from '@/shared/api/directions';

/** Shared across all three known-profession pages so the tree is fetched
 * (and cached by React Query) once per query key, not once per page. */
export function useKnownProfessionTree() {
  return useQuery({
    queryKey: ['directions', 'tree'],
    queryFn: () => directionsApi.tree(),
  });
}
