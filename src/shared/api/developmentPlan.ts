import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { DevelopmentPlanResponse } from '@/shared/types';

export const developmentPlanApi = {
  /** Generate (or return cached) the plan for this assessment + program. */
  generate: (assessmentId: string, programId: string) =>
    apiClient
      .post<DevelopmentPlanResponse>(API.developmentPlan.generate, {
        assessment_id: assessmentId,
        program_id: programId,
      })
      .then(r => r.data),

  get: (assessmentId: string, programId: string) =>
    apiClient
      .get<DevelopmentPlanResponse>(API.developmentPlan.get(assessmentId, programId))
      .then(r => r.data),
};
