import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AssessmentGoal,
  AssessmentResponse,
  Question,
  SaveAnswersPayload,
  SaveAnswersResponse,
  AkinatorTurnResponse,
  AkinatorAnswerRequest,
  AkinatorFeedbackRequest,
  AkinatorFeedbackResponse,
  AkinatorResolveRequest,
  SimulationDetailResponse,
  SimulationSubmitRequest,
  SimulationSubmitResponse,
} from '@/shared/types';

export const assessmentApi = {
  start: (goal: AssessmentGoal) =>
    apiClient.post<AssessmentResponse>(API.assessment.start, { goal }).then(r => r.data),

  current: () =>
    apiClient.get<AssessmentResponse>(API.assessment.current).then(r => r.data),

  getQuestions: (assessmentId: string, block: string) =>
    apiClient
      .get<Question[]>(API.assessment.questions(assessmentId, block))
      .then(r => r.data),

  saveAnswers: (assessmentId: string, payload: SaveAnswersPayload) =>
    apiClient
      .post<SaveAnswersResponse>(API.assessment.answers(assessmentId), payload)
      .then(r => r.data),

  akinatorStart: (assessmentId: string) =>
    apiClient
      .post<AkinatorTurnResponse>(API.assessment.akinatorStart(assessmentId))
      .then(r => r.data),

  akinatorAnswer: (assessmentId: string, payload: AkinatorAnswerRequest) =>
    apiClient
      .post<AkinatorTurnResponse>(API.assessment.akinatorAnswer(assessmentId), payload)
      .then(r => r.data),

  akinatorFeedback: (assessmentId: string, payload: AkinatorFeedbackRequest) =>
    apiClient
      .post<AkinatorFeedbackResponse>(API.assessment.akinatorFeedback(assessmentId), payload)
      .then(r => r.data),

  akinatorReject: (assessmentId: string, slug: string) =>
    apiClient
      .post<AkinatorTurnResponse>(API.assessment.akinatorReject(assessmentId, slug))
      .then(r => r.data),

  akinatorResolve: (assessmentId: string, payload: AkinatorResolveRequest) =>
    apiClient
      .post<AkinatorTurnResponse>(API.assessment.akinatorResolve(assessmentId), payload)
      .then(r => r.data),

  getSimulation: (assessmentId: string, leafSlug: string) =>
    apiClient
      .get<SimulationDetailResponse>(API.assessment.simulation(assessmentId, leafSlug))
      .then(r => r.data),

  submitSimulation: (assessmentId: string, leafSlug: string, payload: SimulationSubmitRequest) =>
    apiClient
      .post<SimulationSubmitResponse>(API.assessment.simulationSubmit(assessmentId, leafSlug), payload)
      .then(r => r.data),
};
