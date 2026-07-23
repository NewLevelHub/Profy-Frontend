import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  ProductFeedbackRequest,
  ProductFeedbackResponse,
  ProductFeedbackStatusResponse,
} from '@/shared/types';

export const feedbackApi = {
  submit: (data: ProductFeedbackRequest) =>
    apiClient.post<ProductFeedbackResponse>(API.feedback.submit, data).then((r) => r.data),

  getStatus: (assessmentId: string, context: string) =>
    apiClient
      .get<ProductFeedbackStatusResponse>(API.feedback.submit, {
        params: { assessment_id: assessmentId, context },
      })
      .then((r) => r.data),
};
