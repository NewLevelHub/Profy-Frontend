import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AdminAssessmentDetail,
  AdminFeedbackListResponse,
  AdminFeedbackStatsResponse,
  AdminProgramDetail,
  AdminProgramUpdateRequest,
  AdminUniversityDetail,
  AdminUniversityListResponse,
  AdminUniversityUpdateRequest,
  AdminUserDetail,
  AdminUserListResponse,
} from '@/shared/types';

export const adminApi = {
  listUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<AdminUserListResponse>(API.admin.users, { params })
      .then((r) => r.data),

  getUser: (userId: string) =>
    apiClient.get<AdminUserDetail>(API.admin.userDetail(userId)).then((r) => r.data),

  getAssessment: (assessmentId: string) =>
    apiClient
      .get<AdminAssessmentDetail>(API.admin.assessmentDetail(assessmentId))
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
};
