import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { BelbinContent, SubmitBelbinPayload, SubmitBelbinResponse } from '@/shared/types';

export const belbinApi = {
  getContent: () =>
    apiClient.get<BelbinContent>(API.assessment.belbinContent).then(r => r.data),

  submit: (assessmentId: string, payload: SubmitBelbinPayload) =>
    apiClient
      .post<SubmitBelbinResponse>(API.assessment.belbin(assessmentId), payload)
      .then(r => r.data),
};
