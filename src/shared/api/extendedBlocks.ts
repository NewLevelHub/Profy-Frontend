import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ExtendedBlocksResponse } from '@/shared/types';

/** Student-facing: what's been assigned to them (Belbin/АСТУР) for one
 *  assessment — post-Ф4.1 follow-up, replaces the hand-delivered link. */
export const extendedBlocksApi = {
  list: (assessmentId: string) =>
    apiClient
      .get<ExtendedBlocksResponse>(API.assessment.extendedBlocks(assessmentId))
      .then(r => r.data),
};
