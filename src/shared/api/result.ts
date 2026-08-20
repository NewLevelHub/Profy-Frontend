import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ResultResponse } from '@/shared/types';

// Some AnalysisResult rows predate the v2 schema and come back as the old
// admin/raw shape entirely (profile/code/meta/big_five/... , no
// report_version, no interest_instrument) rather than ResultV2Schema. That
// isn't a missing-field gap we can patch client-side — the v2 fields
// (strength_cards, interest_map, personality_note, final_analysis, ...)
// simply don't exist in that payload, and synthesizing them from raw scores
// would mean showing the student data/diagnoses the product deliberately
// never exposes (contract §6). Treat it as a failed fetch instead of
// rendering a broken/empty page.
function assertResultV2(data: unknown): asserts data is ResultResponse {
  const d = data as Record<string, unknown> | null;
  const instrument = d?.interest_instrument;
  if (d?.report_version !== 2 || (instrument !== 'mi' && instrument !== 'riasec')) {
    throw new Error('legacy_result_shape');
  }
}

export const resultApi = {
  generate: (assessmentId: string) =>
    apiClient
      .post<ResultResponse>(API.result.generate, { assessment_id: assessmentId })
      .then(r => {
        assertResultV2(r.data);
        return r.data;
      }),

  get: (assessmentId: string) =>
    apiClient
      .get<ResultResponse>(API.result.get(assessmentId))
      .then(r => {
        assertResultV2(r.data);
        return r.data;
      }),
};
