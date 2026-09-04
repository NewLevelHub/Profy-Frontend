import { apiClient } from '@/shared/api/client';
import { API, type AdminContentResource } from '@/shared/api/endpoints';
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
  AdminSortParams,
  AdminUniversityDetail,
  AdminUniversityListResponse,
  AdminUniversityUpdateRequest,
  AdminUserDetail,
  AdminUserListResponse,
  AdminUserStats,
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
  /** Only users not seen for at least this many days. Registration counts as
   *  activity, so a fresh account is never "quiet". */
  inactive_days?: number;
}

/** Filters shared by GET /admin/feedback and GET /admin/feedback/stats — the
 *  stats endpoint takes the same set so the summary describes the rows the
 *  table is showing, instead of always the whole table. */
export interface AdminFeedbackFilterParams {
  search?: string;
  score_min?: number;
  score_max?: number;
  age_group?: AgeGroup;
  section?: string;
  has_comment?: boolean;
}

export interface AdminUniversityFilterParams {
  search?: string;
  country?: string;
  has_ranking?: boolean;
}

/** Shared by the five question-bank content lists. */
export interface AdminContentFilterParams {
  search?: string;
  has_overrides?: boolean;
}

export const adminApi = {
  listUsers: (params?: AdminUserFilterParams & AdminSortParams & { page?: number; limit?: number }) =>
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

  /** Whole-table counts for the tiles above the users list — none of them can
   *  be derived from the page of 20 the list returns. */
  getUserStats: (params?: { inactive_days?: number }) =>
    apiClient.get<AdminUserStats>(API.admin.userStats, { params }).then((r) => r.data),

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

  listFeedback: (
    params?: AdminFeedbackFilterParams & AdminSortParams & { page?: number; limit?: number },
  ) =>
    apiClient
      .get<AdminFeedbackListResponse>(API.admin.feedback, { params })
      .then((r) => r.data),

  /** Takes the same filters as `listFeedback`, so the summary above the table
   *  describes exactly the rows in it. That mismatch is why the screen used to
   *  ignore this endpoint and recompute the aggregates from a fully-downloaded
   *  list instead. */
  getFeedbackStats: (params?: AdminFeedbackFilterParams) =>
    apiClient.get<AdminFeedbackStatsResponse>(API.admin.feedbackStats, { params }).then((r) => r.data),

  listUniversities: (
    params?: AdminUniversityFilterParams & AdminSortParams & { page?: number; limit?: number },
  ) =>
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

  listQuestions: (
    params?: AdminContentFilterParams &
      AdminSortParams & { page?: number; limit?: number; instrument?: Instrument; age_tier?: AgeGroup },
  ) =>
    apiClient.get<AdminQuestionListResponse>(API.admin.questions, { params }).then((r) => r.data),

  getQuestion: (questionId: string) =>
    apiClient.get<AdminQuestionDetail>(API.admin.questionDetail(questionId)).then((r) => r.data),

  updateQuestion: (questionId: string, body: AdminQuestionUpdateRequest) =>
    apiClient.patch<AdminQuestionDetail>(API.admin.questionDetail(questionId), body).then((r) => r.data),

  listQuestionPairs: (
    params?: AdminContentFilterParams &
      AdminSortParams & { page?: number; limit?: number; instrument?: Instrument; age_tier?: AgeGroup },
  ) =>
    apiClient.get<AdminQuestionPairListResponse>(API.admin.questionPairs, { params }).then((r) => r.data),

  getQuestionPair: (pairId: string) =>
    apiClient.get<AdminQuestionPairDetail>(API.admin.questionPairDetail(pairId)).then((r) => r.data),

  updateQuestionPair: (pairId: string, body: AdminQuestionPairUpdateRequest) =>
    apiClient.patch<AdminQuestionPairDetail>(API.admin.questionPairDetail(pairId), body).then((r) => r.data),

  listMotivationStatements: (
    params?: AdminContentFilterParams &
      AdminSortParams & { page?: number; limit?: number; triplet_index?: number; category?: string },
  ) =>
    apiClient
      .get<AdminMotivationStatementListResponse>(API.admin.motivationStatements, { params })
      .then((r) => r.data),

  getMotivationStatement: (id: string) =>
    apiClient.get<AdminMotivationStatementDetail>(API.admin.motivationStatementDetail(id)).then((r) => r.data),

  updateMotivationStatement: (id: string, body: AdminMotivationStatementUpdateRequest) =>
    apiClient
      .patch<AdminMotivationStatementDetail>(API.admin.motivationStatementDetail(id), body)
      .then((r) => r.data),

  listMotivationPairs: (
    params?: AdminContentFilterParams & AdminSortParams & { page?: number; limit?: number; category?: string },
  ) =>
    apiClient.get<AdminMotivationPairListResponse>(API.admin.motivationPairs, { params }).then((r) => r.data),

  getMotivationPair: (id: string) =>
    apiClient.get<AdminMotivationPairDetail>(API.admin.motivationPairDetail(id)).then((r) => r.data),

  updateMotivationPair: (id: string, body: AdminMotivationPairUpdateRequest) =>
    apiClient.patch<AdminMotivationPairDetail>(API.admin.motivationPairDetail(id), body).then((r) => r.data),

  listDirections: (
    params?: AdminContentFilterParams &
      AdminSortParams & { page?: number; limit?: number; catalog_filled?: boolean },
  ) =>
    apiClient.get<AdminDirectionListResponse>(API.admin.directions, { params }).then((r) => r.data),

  getDirection: (id: string) =>
    apiClient.get<AdminDirectionDetail>(API.admin.directionDetail(id)).then((r) => r.data),

  updateDirection: (id: string, body: AdminDirectionUpdateRequest) =>
    apiClient.patch<AdminDirectionDetail>(API.admin.directionDetail(id), body).then((r) => r.data),

  /** Undo one admin edit, or every edit on the row when `field` is omitted.
   *
   *  Returns the row as it now stands, with the bank value restored — not a
   *  deferred "will be fixed on the next deploy". Responds 409, not 404, when
   *  the field carries no override: the row is fine and the caller's view of
   *  it was simply stale.
   *
   *  Typed loosely by design: the five content detail shapes differ, and every
   *  caller already knows which one it asked for. */
  clearContentOverrides: <T>(resource: AdminContentResource, id: string, field?: string) =>
    apiClient
      .delete<T>(
        field
          ? API.admin.contentOverrideField(resource, id, field)
          : API.admin.contentOverrides(resource, id),
      )
      .then((r) => r.data),

  /** Universities and programs record only the NAME of a hand-edited field,
   *  never the value it replaced, so this restores nothing by itself — it
   *  returns the field to the next seed run's control, which is the only
   *  recovery path a lock has ever had. Label it accordingly in the UI. */
  unlockUniversityFields: (universityId: string, field?: string) =>
    apiClient
      .delete<AdminUniversityDetail>(
        field
          ? API.admin.universityLockField(universityId, field)
          : API.admin.universityLocks(universityId),
      )
      .then((r) => r.data),

  unlockProgramFields: (programId: string, field?: string) =>
    apiClient
      .delete<AdminProgramDetail>(
        field ? API.admin.programLockField(programId, field) : API.admin.programLocks(programId),
      )
      .then((r) => r.data),
};
