import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AdminAssessmentDetail,
  AdminFeedbackListResponse,
  AdminFeedbackStatsResponse,
  AdminStatsResponse,
  AdminUserDetail,
  AdminUserListResponse,
  FeedbackRating,
} from '@/shared/types';

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminStatsResponse>(API.admin.stats).then((r) => r.data),

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

  listFeedback: (params?: { page?: number; limit?: number; rating?: FeedbackRating }) =>
    apiClient
      .get<AdminFeedbackListResponse>(API.admin.feedback, { params })
      .then((r) => r.data),

  getFeedbackStats: () =>
    apiClient.get<AdminFeedbackStatsResponse>(API.admin.feedbackStats).then((r) => r.data),
};
