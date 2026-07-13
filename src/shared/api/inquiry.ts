import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { DirectionQuestionsResponse, DirectionVerdict } from '@/shared/types';

export const inquiryApi = {
  getQuestions: (assessmentId: string, slug: string) =>
    apiClient
      .get<DirectionQuestionsResponse>(API.inquiry.questions(assessmentId, slug))
      .then(r => r.data),

  submitAnswers: (assessmentId: string, slug: string, answers: number[]) =>
    apiClient
      .post<DirectionVerdict>(API.inquiry.verdict(assessmentId, slug), { answers })
      .then(r => r.data),
};
