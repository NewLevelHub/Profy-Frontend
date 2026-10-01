import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AsturAttempt,
  AsturState,
  StartAsturSubtestResponse,
  SubmitAsturSubtestPayload,
  SubmitAsturSubtestResponse,
} from '@/shared/types';

export const asturApi = {
  getState: (assessmentId: string) =>
    apiClient.get<AsturState>(API.assessment.asturState(assessmentId)).then(r => r.data),

  /** Opens (or resumes) the attempt and returns it with its own content.
   *  `retake: true` is the explicit «Пройти заново» after a completed one. */
  openAttempt: (assessmentId: string, retake = false) =>
    apiClient.post<AsturAttempt>(API.assessment.asturAttempt(assessmentId), { retake }).then(r => r.data),

  startSubtest: (assessmentId: string, n: number, runId: string) =>
    apiClient
      .post<StartAsturSubtestResponse>(API.assessment.asturStart(assessmentId, n), { run_id: runId })
      .then(r => r.data),

  submitSubtest: (assessmentId: string, n: number, payload: SubmitAsturSubtestPayload) =>
    apiClient
      .post<SubmitAsturSubtestResponse>(API.assessment.asturSubtest(assessmentId, n), payload)
      .then(r => r.data),
};
