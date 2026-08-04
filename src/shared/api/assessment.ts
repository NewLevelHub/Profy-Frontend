import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AssessmentGoal,
  AssessmentResponse,
  Question,
  SaveAnswersPayload,
  SaveAnswersResponse,
} from '@/shared/types';

export const assessmentApi = {
  start: (goal: AssessmentGoal) =>
    apiClient.post<AssessmentResponse>(API.assessment.start, { goal }).then(r => r.data),

  current: () =>
    apiClient.get<AssessmentResponse>(API.assessment.current).then(r => r.data),

  getQuestions: (assessmentId: string) =>
    apiClient
      .get<Question[]>(API.assessment.questions(assessmentId))
      .then(r => r.data),

  saveAnswers: (assessmentId: string, payload: SaveAnswersPayload) =>
    apiClient
      .post<SaveAnswersResponse>(API.assessment.answers(assessmentId), payload)
      .then(r => r.data),
};
