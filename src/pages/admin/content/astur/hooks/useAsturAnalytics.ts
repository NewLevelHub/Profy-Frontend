import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAsturApi } from '@/shared/api/adminAstur';
import type { AsturAgeBand } from '@/shared/types';

/** Per-item analytics of one published version, cut by age band / grade at
 *  completion — for finding too-easy, confusing or broken items. */
export function useAsturAnalytics(versionId: string) {
  const [ageBand, setAgeBand] = useState<AsturAgeBand | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [synonymError, setSynonymError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const version = useQuery({
    queryKey: ['adminAsturVersion', versionId],
    queryFn: () => adminAsturApi.getVersion(versionId),
  });
  const analytics = useQuery({
    queryKey: ['adminAsturAnalytics', versionId, ageBand, grade],
    queryFn: () => adminAsturApi.analytics(versionId, { ageBand, grade }),
  });

  /** Adds the phrasing to the open draft (created if needed) — it only
   *  counts once that draft is published as a new version. */
  async function addSynonym(itemId: string, locale: 'ru' | 'kk', text: string, tier: 'score_1' | 'score_2') {
    setSynonymError(null);
    try {
      await adminAsturApi.addSynonym({ item_id: itemId, tier, locale, text });
      setAdded((prev) => new Set(prev).add(`${itemId}|${locale}|${text}`));
      await queryClient.invalidateQueries({ queryKey: ['adminAsturVersions'] });
    } catch {
      setSynonymError('Не удалось добавить формулировку — возможно, она уже есть в словаре черновика.');
    }
  }

  return {
    addSynonym,
    isAdded: (itemId: string, locale: string, text: string) => added.has(`${itemId}|${locale}|${text}`),
    synonymError,
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
