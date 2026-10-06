import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  BelbinContent,
  BelbinProgressResponse,
  SubmitBelbinPayload,
  SubmitBelbinResponse,
} from '@/shared/types';

export const belbinApi = {
  getContent: () =>
    apiClient.get<BelbinContent>(API.assessment.belbinContent).then(r => r.data),

  submit: (assessmentId: string, payload: SubmitBelbinPayload) =>
    apiClient
      .post<SubmitBelbinResponse>(API.assessment.belbin(assessmentId), payload)
      .then(r => r.data),

  getProgress: (assessmentId: string) =>
    apiClient
      .get<BelbinProgressResponse>(API.assessment.belbinProgress(assessmentId))
      .then(r => r.data),

  saveProgressBlock: (assessmentId: string, blockIndex: number, allocation: Record<string, number>) =>
    apiClient
      .put<BelbinProgressResponse>(API.assessment.belbinProgressBlock(assessmentId, blockIndex), { allocation })
      .then(r => r.data),
};
