import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  MacCard,
  MacSessionResponse,
  MacSpreadResponse,
  SubmitMacResponsePayload,
  SubmitMacResponseResponse,
} from '@/shared/types';

export const macApi = {
  /** Get-or-create the МАК session for this assessment + the active
   *  exercise config. Idempotent — safe to call again on remount. */
  createOrGetSession: (assessmentId: string) =>
    apiClient
      .post<MacSessionResponse>(API.mac.session, { assessment_id: assessmentId })
      .then((r) => r.data),

  /** `blind` draw — a random card not yet drawn in this session. */
  draw: (sessionId: string, exerciseId: string) =>
    apiClient
      .post<MacCard>(API.mac.draw(sessionId), { exercise_id: exerciseId })
      .then((r) => r.data),

  /** `open` draw — a face-up spread to pick from. Not wired into the demo
   *  flow yet (only E1/`blind` is active), kept for parity with the backend. */
  getSpread: (exerciseId: string) =>
    apiClient
      .get<MacSpreadResponse>(API.mac.spread(exerciseId))
      .then((r) => r.data),

  submitResponse: (payload: SubmitMacResponsePayload) =>
    apiClient
      .post<SubmitMacResponseResponse>(API.mac.response, payload)
      .then((r) => r.data),
};
