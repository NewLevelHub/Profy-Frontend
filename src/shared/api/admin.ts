import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AdminAssessmentDetail,
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
};
