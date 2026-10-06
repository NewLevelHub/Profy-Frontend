import { apiClient, readAccessToken } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import { env } from '@/shared/config/env';
import { readPersistedLocale } from '@/shared/store/locale';
import type {
  AsturAttempt,
  ResetAsturSubtestResponse,
  AsturState,
  StartAsturSubtestResponse,
  SubmitAsturSubtestPayload,
  SubmitAsturSubtestResponse,
} from '@/shared/types';

function absoluteApiUrl(path: string): string {
  return `${env.API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export const asturApi = {
  getState: (assessmentId: string) =>
    apiClient.get<AsturState>(API.assessment.asturState(assessmentId)).then(r => r.data),

  /** Opens (or resumes) the attempt and returns it with its own content. */
  openAttempt: (assessmentId: string) =>
    apiClient.post<AsturAttempt>(API.assessment.asturAttempt(assessmentId)).then(r => r.data),

  startSubtest: (assessmentId: string, n: number, runId: string, stateVersion: number) =>
    apiClient
      .post<StartAsturSubtestResponse>(API.assessment.asturStart(assessmentId, n), {
        run_id: runId,
        state_version: stateVersion,
      })
      .then(r => r.data),

  resetSubtest: (assessmentId: string, n: number, runId: string, stateVersion: number) =>
    apiClient
      .post<ResetAsturSubtestResponse>(API.assessment.asturReset(assessmentId, n), {
        run_id: runId,
        state_version: stateVersion,
      })
      .then(r => r.data),

  /**
   * Best-effort reset when the document is actually being unloaded. Unlike
   * sendBeacon, fetch keepalive can carry the Bearer token used by this app.
   * Correctness never depends on this request: a missed unload is reconciled
   * when the ASTUR page is opened again.
   */
  resetSubtestOnUnload: (assessmentId: string, n: number, runId: string, stateVersion: number) => {
    const token = readAccessToken();
    if (!token) return;
    void fetch(absoluteApiUrl(API.assessment.asturReset(assessmentId, n)), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': readPersistedLocale(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        run_id: runId,
        state_version: stateVersion,
      }),
      keepalive: true,
    }).catch(() => undefined);
  },

  submitSubtest: (assessmentId: string, n: number, payload: SubmitAsturSubtestPayload) =>
    apiClient
      .post<SubmitAsturSubtestResponse>(API.assessment.asturSubtest(assessmentId, n), payload)
      .then(r => r.data),
};
