import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAsturApi } from '@/shared/api/adminAstur';
import type { AsturAgeBand } from '@/shared/types';

/** Per-item analytics of one published version, cut by age band / grade at
 *  completion — for finding too-easy, confusing or broken items. */
export function useAsturAnalytics(versionId: string) {
  const [ageBand, setAgeBand] = useState<AsturAgeBand | null>(null);
  const [grade, setGrade] = useState<number | null>(null);

  const version = useQuery({
    queryKey: ['adminAsturVersion', versionId],
    queryFn: () => adminAsturApi.getVersion(versionId),
  });
  const analytics = useQuery({
    queryKey: ['adminAsturAnalytics', versionId, ageBand, grade],
    queryFn: () => adminAsturApi.analytics(versionId, { ageBand, grade }),
  });

  return {
    version: version.data,
    analytics: analytics.data,
    isLoading: version.isLoading || analytics.isLoading,
    isError: version.isError || analytics.isError,
    ageBand,
    setAgeBand,
    grade,
    setGrade,
  };
}
