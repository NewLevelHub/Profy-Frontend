import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  FinishPsychoEmotionalPayload,
  FinishPsychoEmotionalResponse,
  StartPsychoEmotionalPayload,
  StartPsychoEmotionalResponse,
} from '@/shared/types';

export const psychoEmotionalApi = {
  /** Круг 1 — перед основной батареей тестов. Ответ несёт только `run_id`
   *  (§5.6) — им закрывается finish в конце прохождения. */
  start: (assessmentId: string, payload: StartPsychoEmotionalPayload) =>
    apiClient
      .post<StartPsychoEmotionalResponse>(
        API.assessment.psychoemotionalStart(assessmentId),
        payload,
      )
      .then((r) => r.data),

  /** Круг 2 + check-in — в конце всего прохождения, завершает строку из start. */
  finish: (assessmentId: string, runId: string, payload: FinishPsychoEmotionalPayload) =>
    apiClient
      .post<FinishPsychoEmotionalResponse>(
        API.assessment.psychoemotionalFinish(assessmentId, runId),
        payload,
      )
      .then((r) => r.data),
};
