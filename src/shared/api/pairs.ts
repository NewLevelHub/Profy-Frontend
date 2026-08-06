import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  QuestionPair,
  SubmitPairAnswersPayload,
  SubmitPairAnswersResponse,
} from '@/shared/types';

export const pairsApi = {
  getPairs: (assessmentId: string) =>
    apiClient
      .get<QuestionPair[]>(API.assessment.pairs(assessmentId))
      .then(r => r.data),

  submitAnswers: (assessmentId: string, payload: SubmitPairAnswersPayload) =>
    apiClient
      .post<SubmitPairAnswersResponse>(API.assessment.pairAnswers(assessmentId), payload)
      .then(r => r.data),
};
