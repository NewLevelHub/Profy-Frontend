import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { SubjectAnswerPayload, SubjectQuestion, SubjectReadinessResult } from '@/shared/types';

export const subjectReadinessApi = {
  getQuestions: (assessmentId: string) =>
    apiClient
      .get<SubjectQuestion[]>(API.subjectReadiness.questions(assessmentId))
      .then(r => r.data),

  submitAnswers: (assessmentId: string, answers: SubjectAnswerPayload[]) =>
    apiClient
      .post<SubjectReadinessResult>(API.subjectReadiness.submit(assessmentId), { answers })
      .then(r => r.data),

  getResult: (assessmentId: string) =>
    apiClient
      .get<SubjectReadinessResult>(API.subjectReadiness.result(assessmentId))
      .then(r => r.data),
};
