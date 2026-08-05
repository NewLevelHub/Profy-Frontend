import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  MotivationTriplet,
  SubmitMotivationPayload,
  SubmitMotivationResponse,
} from '@/shared/types';

export const motivationApi = {
  getTriplets: (assessmentId: string) =>
    apiClient
      .get<MotivationTriplet[]>(API.assessment.motivationTriplets(assessmentId))
      .then(r => r.data),

  submitAnswers: (assessmentId: string, payload: SubmitMotivationPayload) =>
    apiClient
      .post<SubmitMotivationResponse>(API.assessment.motivationAnswers(assessmentId), payload)
      .then(r => r.data),
};
