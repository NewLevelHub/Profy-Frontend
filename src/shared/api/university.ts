import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type {
  ProgramBrief,
  ProgramDetail,
  UniversityCountry,
  UniversityDetail,
  UniversityListParams,
  UniversityListResponse,
} from '@/shared/types';

export const universityApi = {
  getPrograms: (professionSlug: string, country?: string) =>
    apiClient
      .get<ProgramBrief[]>(API.universities.programs, {
        params: { profession: professionSlug, limit: 50, ...(country ? { country } : {}) },
      })
      .then(r => r.data),

  getProgramDetail: (id: string) =>
    apiClient
      .get<ProgramDetail>(API.universities.programDetail(id))
      .then(r => r.data),

  // ── Standalone catalogue (PRO-265) ────────────────────────────────────────
  // Unlike getPrograms, this one is not scoped to a direction and is paginated
  // server-side — the table is ~250 rows, so "fetch everything and filter on
  // the client" is not an option here.
  list: (params: UniversityListParams) =>
    apiClient
      .get<UniversityListResponse>(API.universities.list, { params })
      .then(r => r.data),

  listCountries: () =>
    apiClient
      .get<UniversityCountry[]>(API.universities.countries)
      .then(r => r.data),

  getDetail: (id: string) =>
    apiClient
      .get<UniversityDetail>(API.universities.detail(id))
      .then(r => r.data),

  // PUT/DELETE rather than POST — starring is idempotent, so a double click
  // is a no-op instead of an error the UI would have to swallow.
  addFavorite: (id: string) =>
    apiClient.put<void>(API.universities.favorite(id)).then(() => undefined),

  removeFavorite: (id: string) =>
    apiClient.delete<void>(API.universities.favorite(id)).then(() => undefined),
};
