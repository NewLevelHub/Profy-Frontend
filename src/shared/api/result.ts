import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { AnalysisResultResponse } from '@/shared/types';

export const resultApi = {
  generate: (assessmentId: string) =>
    apiClient
      .post<AnalysisResultResponse>(API.result.generate, { assessment_id: assessmentId })
      .then(r => r.data),

  get: (assessmentId: string) =>
    apiClient
      .get<AnalysisResultResponse>(API.result.get(assessmentId))
      .then(r => r.data),
};
