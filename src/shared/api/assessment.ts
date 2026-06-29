import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { AssessmentGoal, AssessmentResponse } from '@/shared/types';

export const assessmentApi = {
  start: (goal: AssessmentGoal) =>
    apiClient.post<AssessmentResponse>(API.assessment.start, { goal }).then(r => r.data),

  current: () =>
    apiClient.get<AssessmentResponse>(API.assessment.current).then(r => r.data),
};
