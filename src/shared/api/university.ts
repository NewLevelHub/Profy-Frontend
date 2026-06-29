import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { GapAnalysisResponse, ProgramBrief, ProgramDetail } from '@/shared/types';

export const universityApi = {
  getPrograms: (directionSlug: string, country?: string) =>
    apiClient
      .get<ProgramBrief[]>(API.universities.programs, {
        params: { direction: directionSlug, limit: 50, ...(country ? { country } : {}) },
      })
      .then(r => r.data),

  getProgramDetail: (id: string) =>
    apiClient
      .get<ProgramDetail>(API.universities.programDetail(id))
      .then(r => r.data),

  getGapAnalysis: (programId: string, assessmentId: string) =>
    apiClient
      .get<GapAnalysisResponse>(API.universities.gapAnalysis(programId), {
        params: { assessment_id: assessmentId },
      })
      .then(r => r.data),
};
