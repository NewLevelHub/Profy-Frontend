import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { RoadmapResponse } from '@/shared/types';

export const roadmapApi = {
  generate: (assessmentId: string, programId?: string) =>
    apiClient
      .post<RoadmapResponse>(API.roadmap.generate, {
        assessment_id: assessmentId,
        ...(programId !== undefined ? { program_id: programId } : {}),
      })
      .then(r => r.data),

  get: (assessmentId: string) =>
    apiClient
      .get<RoadmapResponse>(API.roadmap.get(assessmentId))
      .then(r => r.data),
};
