import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  MotivationPairItem,
  SubmitMotivationPairPayload,
  SubmitMotivationPairResponse,
} from '@/shared/types';

export const motivationPairsApi = {
  getPairs: (assessmentId: string) =>
    apiClient
      .get<MotivationPairItem[]>(API.assessment.motivationPairs(assessmentId))
      .then(r => r.data),

  submitAnswers: (assessmentId: string, payload: SubmitMotivationPairPayload) =>
    apiClient
      .post<SubmitMotivationPairResponse>(API.assessment.motivationPairAnswers(assessmentId), payload)
      .then(r => r.data),
};
