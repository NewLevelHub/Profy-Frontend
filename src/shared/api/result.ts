import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { GoalOverlayResponse, ResultResponse } from '@/shared/types';

export const resultApi = {
  generate: (assessmentId: string) =>
    apiClient
      .post<ResultResponse>(API.result.generate, { assessment_id: assessmentId })
      .then(r => r.data),

  get: (assessmentId: string) =>
    apiClient
      .get<ResultResponse>(API.result.get(assessmentId))
      .then(r => r.data),

  getGoalContext: (assessmentId: string, programId?: string) =>
    apiClient
      .get<GoalOverlayResponse>(API.result.goalContext(assessmentId), {
        params: programId ? { program_id: programId } : undefined,
      })
      .then(r => r.data),
};
