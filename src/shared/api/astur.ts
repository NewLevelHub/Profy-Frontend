import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AsturContent,
  StartAsturSubtestResponse,
  SubmitAsturSubtestPayload,
  SubmitAsturSubtestResponse,
} from '@/shared/types';

export const asturApi = {
  getContent: () =>
    apiClient.get<AsturContent>(API.assessment.asturContent).then(r => r.data),

  startSubtest: (assessmentId: string, n: number) =>
    apiClient
      .post<StartAsturSubtestResponse>(API.assessment.asturStart(assessmentId, n))
      .then(r => r.data),

  submitSubtest: (assessmentId: string, n: number, payload: SubmitAsturSubtestPayload) =>
    apiClient
      .post<SubmitAsturSubtestResponse>(API.assessment.asturSubtest(assessmentId, n), payload)
      .then(r => r.data),
};
