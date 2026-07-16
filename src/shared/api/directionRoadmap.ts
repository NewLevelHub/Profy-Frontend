import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { DirectionRoadmapResponse } from '@/shared/types';

export const directionRoadmapApi = {
  /** Confirms the direction and builds the plan for it. */
  generate: (assessmentId: string, slug: string) =>
    apiClient
      .post<DirectionRoadmapResponse>(API.roadmap.generateDirection, {
        assessment_id: assessmentId,
        direction_slug: slug,
      })
      .then(r => r.data),

  get: (assessmentId: string, slug: string) =>
    apiClient
      .get<DirectionRoadmapResponse>(API.roadmap.getDirection(assessmentId, slug))
      .then(r => r.data),
};
