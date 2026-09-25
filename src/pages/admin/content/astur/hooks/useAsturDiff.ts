import { useQuery } from '@tanstack/react-query';
import { adminAsturApi } from '@/shared/api/adminAstur';

/** Changes of a version relative to the version it was branched from. */
export function useAsturDiff(versionId: string) {
  return useQuery({
    queryKey: ['adminAsturDiff', versionId],
    queryFn: () => adminAsturApi.diff(versionId),
  });
}
