import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AdminAssessmentDetail,
  AdminUserDetail,
  AdminUserListResponse,
  AdminUniversityListResponse,
  AdminUniversityDetail,
  AdminUniversityUpdatePayload,
  AdminProgramDetail,
  AdminProgramUpdatePayload,
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

  listUniversities: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<AdminUniversityListResponse>(API.admin.universities, { params })
      .then((r) => r.data),

  getUniversity: (id: string) =>
    apiClient
      .get<AdminUniversityDetail>(API.admin.universityDetail(id))
      .then((r) => r.data),

  updateUniversity: (id: string, payload: AdminUniversityUpdatePayload) =>
    apiClient
      .patch<AdminUniversityDetail>(API.admin.universityDetail(id), payload)
      .then((r) => r.data),

  getProgram: (id: string) =>
    apiClient
      .get<AdminProgramDetail>(API.admin.programDetail(id))
      .then((r) => r.data),

  updateProgram: (id: string, payload: AdminProgramUpdatePayload) =>
    apiClient
      .patch<AdminProgramDetail>(API.admin.programDetail(id), payload)
      .then((r) => r.data),
};
