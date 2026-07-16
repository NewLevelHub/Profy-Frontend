import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { AkinatorResultResponse } from '@/shared/types';

// No generate step — the akinator's own reveal + feedback already produced
// everything this needs (see profi-backend app/routers/result.py).
export const resultApi = {
  get: (assessmentId: string) =>
    apiClient
      .get<AkinatorResultResponse>(API.result.get(assessmentId))
      .then(r => r.data),
};
