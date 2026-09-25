import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  AsturAgeBand,
  AsturBankAnalytics,
  AsturBankDiff,
  AsturBankDocument,
  AsturBankVersionDetail,
  AsturBankVersionSummary,
} from '@/shared/types';

/** АСТУР bank versions: draft → validate → publish → immutable (PRO-427). */
export const adminAsturApi = {
  listVersions: () =>
    apiClient
      .get<{ items: AsturBankVersionSummary[] }>(API.admin.asturBankVersions)
      .then((r) => r.data.items),

  getVersion: (id: string) =>
    apiClient.get<AsturBankVersionDetail>(API.admin.asturBankVersion(id)).then((r) => r.data),

  /** Returns the open draft if one exists, else branches a new one. */
  createDraft: () =>
    apiClient.post<AsturBankVersionDetail>(API.admin.asturBankDraft).then((r) => r.data),

  updateDraft: (id: string, document: AsturBankDocument, notes: string | null) =>
    apiClient
      .put<AsturBankVersionDetail>(API.admin.asturBankVersion(id), { document, notes })
      .then((r) => r.data),

  deleteDraft: (id: string) => apiClient.delete(API.admin.asturBankVersion(id)).then(() => undefined),

  publish: (id: string, confirmedItemIds: string[]) =>
    apiClient
      .post<AsturBankVersionDetail>(API.admin.asturBankPublish(id), { confirmed_item_ids: confirmedItemIds })
      .then((r) => r.data),

  /** Accept a recurring unrecognized open answer into the next draft. */
  addSynonym: (body: { item_id: string; tier: 'score_1' | 'score_2'; locale: 'ru' | 'kk'; text: string }) =>
    apiClient.post<AsturBankVersionDetail>(API.admin.asturBankSynonyms, body).then((r) => r.data),

  diff: (id: string, against?: string) =>
    apiClient
      .get<AsturBankDiff>(API.admin.asturBankDiff(id), { params: against ? { against } : undefined })
      .then((r) => r.data),

  analytics: (id: string, filters: { ageBand?: AsturAgeBand | null; grade?: number | null }) =>
    apiClient
      .get<AsturBankAnalytics>(API.admin.asturBankAnalytics(id), {
        params: {
          ...(filters.ageBand ? { age_band: filters.ageBand } : {}),
          ...(filters.grade ? { grade: filters.grade } : {}),
        },
      })
      .then((r) => r.data),
};
