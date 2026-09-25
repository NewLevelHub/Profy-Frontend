import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AsturContent,
  AsturRunSummary,
  AsturState,
  StartAsturSubtestResponse,
  SubmitAsturSubtestPayload,
  SubmitAsturSubtestResponse,
} from '@/shared/types';

export const asturApi = {
  getState: (assessmentId: string) =>
    apiClient.get<AsturState>(API.assessment.asturState(assessmentId)).then(r => r.data),

  /** Explicit «Пройти заново» — idempotent while an attempt is open. */
  startRetake: (assessmentId: string) =>
    apiClient.post<AsturRunSummary>(API.assessment.asturRuns(assessmentId)).then(r => r.data),

  getContent: (assessmentId: string) =>
    apiClient.get<AsturContent>(API.assessment.asturContent(assessmentId)).then(r => r.data),

  startSubtest: (assessmentId: string, n: number) =>
    apiClient
      .post<StartAsturSubtestResponse>(API.assessment.asturStart(assessmentId, n))
      .then(r => r.data),

  submitSubtest: (assessmentId: string, n: number, payload: SubmitAsturSubtestPayload) =>
    apiClient
      .post<SubmitAsturSubtestResponse>(API.assessment.asturSubtest(assessmentId, n), payload)
      .then(r => r.data),
};
