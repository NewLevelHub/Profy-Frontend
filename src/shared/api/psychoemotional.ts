import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  SubmitPsychoEmotionalPayload,
  SubmitPsychoEmotionalResponse,
} from '@/shared/types';

export const psychoEmotionalApi = {
  /** Одно прохождение психоэмоционального теста. Результат пользователю не
   *  возвращается (§5.6) — ответ несёт только `run_id` / `tech_invalid`. */
  submit: (assessmentId: string, payload: SubmitPsychoEmotionalPayload) =>
    apiClient
      .post<SubmitPsychoEmotionalResponse>(
        API.assessment.psychoemotional(assessmentId),
        payload,
      )
      .then((r) => r.data),
};
