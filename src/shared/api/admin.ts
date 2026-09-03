import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AdminAssessmentDetail,
  AdminDirectionDetail,
  AdminDirectionListResponse,
  AdminDirectionUpdateRequest,
  AdminFeedbackListResponse,
  AdminFeedbackStatsResponse,
  AdminMotivationPairDetail,
  AdminMotivationPairListResponse,
  AdminMotivationPairUpdateRequest,
  AdminMotivationStatementDetail,
  AdminMotivationStatementListResponse,
  AdminMotivationStatementUpdateRequest,
  AdminProgramDetail,
  AdminProgramUpdateRequest,
  AdminQuestionDetail,
  AdminQuestionListResponse,
  AdminQuestionPairDetail,
  AdminQuestionPairListResponse,
  AdminQuestionPairUpdateRequest,
  AdminQuestionUpdateRequest,
  AdminUniversityDetail,
  AdminUniversityListResponse,
  AdminUniversityUpdateRequest,
  AdminUserDetail,
  AdminUserListResponse,
  AgeGroup,
  AssessmentGoal,
  AssessmentStatus,
  Instrument,
} from '@/shared/types';

interface AdminUserFilterParams {
  search?: string;
  age_group?: AgeGroup;
  status?: AssessmentStatus;
  goal?: AssessmentGoal;
}

export const adminApi = {
  listUsers: (params?: AdminUserFilterParams & { page?: number; limit?: number }) =>
    apiClient
      .get<AdminUserListResponse>(API.admin.users, { params })
      .then((r) => r.data),

  /** Unpaginated CSV of every user matching the filters — same params as
   *  `listUsers` minus page/limit. Returns the raw Blob; caller triggers the
   *  download (see `shared/lib/downloadBlob.ts`), never parse this as JSON. */
  exportUsers: (params?: AdminUserFilterParams) =>
    apiClient
      .get<Blob>(API.admin.usersExport, { params, responseType: 'blob' })
      .then((r) => r.data),

  getUser: (userId: string) =>
    apiClient.get<AdminUserDetail>(API.admin.userDetail(userId)).then((r) => r.data),

  getAssessment: (assessmentId: string) =>
    apiClient
      .get<AdminAssessmentDetail>(API.admin.assessmentDetail(assessmentId))
      .then((r) => r.data),

  /** ZIP of one assessment's full result — summary.csv + responses.csv +
   *  (optionally) motivation.csv, each a real single-header table (previously
   *  3 uneven blocks in one CSV; that broke any parser expecting one flat
   *  table, hence the ZIP). Raw Blob either way — never parse as CSV/JSON,
   *  just hand it to `downloadBlob`, same caveat as `exportUsers`. */
  exportAssessment: (assessmentId: string) =>
    apiClient
      .get<Blob>(API.admin.assessmentExport(assessmentId), { responseType: 'blob' })
      .then((r) => r.data),

  listFeedback: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<AdminFeedbackListResponse>(API.admin.feedback, { params })
      .then((r) => r.data),

  getFeedbackStats: () =>
    apiClient.get<AdminFeedbackStatsResponse>(API.admin.feedbackStats).then((r) => r.data),

  listUniversities: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<AdminUniversityListResponse>(API.admin.universities, { params })
      .then((r) => r.data),

  getUniversity: (universityId: string) =>
    apiClient
      .get<AdminUniversityDetail>(API.admin.universityDetail(universityId))
      .then((r) => r.data),

  updateUniversity: (universityId: string, body: AdminUniversityUpdateRequest) =>
    apiClient
      .patch<AdminUniversityDetail>(API.admin.universityDetail(universityId), body)
      .then((r) => r.data),

  getProgram: (programId: string) =>
    apiClient.get<AdminProgramDetail>(API.admin.programDetail(programId)).then((r) => r.data),

  updateProgram: (programId: string, body: AdminProgramUpdateRequest) =>
    apiClient
      .patch<AdminProgramDetail>(API.admin.programDetail(programId), body)
      .then((r) => r.data),

  listQuestions: (params?: { page?: number; limit?: number; instrument?: Instrument; age_tier?: AgeGroup; search?: string }) =>
    apiClient.get<AdminQuestionListResponse>(API.admin.questions, { params }).then((r) => r.data),

  getQuestion: (questionId: string) =>
    apiClient.get<AdminQuestionDetail>(API.admin.questionDetail(questionId)).then((r) => r.data),

  updateQuestion: (questionId: string, body: AdminQuestionUpdateRequest) =>
    apiClient.patch<AdminQuestionDetail>(API.admin.questionDetail(questionId), body).then((r) => r.data),

  listQuestionPairs: (params?: { page?: number; limit?: number; instrument?: Instrument; age_tier?: AgeGroup }) =>
    apiClient.get<AdminQuestionPairListResponse>(API.admin.questionPairs, { params }).then((r) => r.data),

  getQuestionPair: (pairId: string) =>
    apiClient.get<AdminQuestionPairDetail>(API.admin.questionPairDetail(pairId)).then((r) => r.data),

  updateQuestionPair: (pairId: string, body: AdminQuestionPairUpdateRequest) =>
    apiClient.patch<AdminQuestionPairDetail>(API.admin.questionPairDetail(pairId), body).then((r) => r.data),

  listMotivationStatements: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<AdminMotivationStatementListResponse>(API.admin.motivationStatements, { params })
      .then((r) => r.data),

  getMotivationStatement: (id: string) =>
    apiClient.get<AdminMotivationStatementDetail>(API.admin.motivationStatementDetail(id)).then((r) => r.data),

  updateMotivationStatement: (id: string, body: AdminMotivationStatementUpdateRequest) =>
    apiClient
      .patch<AdminMotivationStatementDetail>(API.admin.motivationStatementDetail(id), body)
      .then((r) => r.data),

  listMotivationPairs: (params?: { page?: number; limit?: number }) =>
    apiClient.get<AdminMotivationPairListResponse>(API.admin.motivationPairs, { params }).then((r) => r.data),

  getMotivationPair: (id: string) =>
    apiClient.get<AdminMotivationPairDetail>(API.admin.motivationPairDetail(id)).then((r) => r.data),

  updateMotivationPair: (id: string, body: AdminMotivationPairUpdateRequest) =>
    apiClient.patch<AdminMotivationPairDetail>(API.admin.motivationPairDetail(id), body).then((r) => r.data),

  listDirections: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<AdminDirectionListResponse>(API.admin.directions, { params }).then((r) => r.data),

  getDirection: (id: string) =>
    apiClient.get<AdminDirectionDetail>(API.admin.directionDetail(id)).then((r) => r.data),

  updateDirection: (id: string, body: AdminDirectionUpdateRequest) =>
    apiClient.patch<AdminDirectionDetail>(API.admin.directionDetail(id), body).then((r) => r.data),
};
