import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';
import type { ResultPendingReview, ResultResponse } from '@/shared/types';

/** The report exists but a psychologist hasn't published it yet (PRO-337). */
export function isPendingReview(data: unknown): data is ResultPendingReview {
  return (data as { status?: unknown } | null)?.status === 'pending_review';
}

// Some AnalysisResult rows predate the v2 schema and come back as the old
// admin/raw shape entirely (profile/code/meta/big_five/... , no
// report_version, no interest_instrument) rather than ResultV2Schema. That
// isn't a missing-field gap we can patch client-side — the v2 fields
// (strength_cards, interest_map, personality_note, final_analysis, ...)
// simply don't exist in that payload, and synthesizing them from raw scores
// would mean showing the student data/diagnoses the product deliberately
// never exposes (contract §6). Treat it as a failed fetch instead of
// rendering a broken/empty page. The pending-review envelope is checked
// first — it is a legitimate answer, not a legacy row.
function assertResultV2(data: unknown): asserts data is ResultResponse | ResultPendingReview {
  if (isPendingReview(data)) return;
  const d = data as Record<string, unknown> | null;
  const instrument = d?.interest_instrument;
  if (d?.report_version !== 2 || (instrument !== 'mi' && instrument !== 'riasec')) {
    throw new Error('legacy_result_shape');
  }
}

export const resultApi = {
  generate: (assessmentId: string) =>
    apiClient
      .post<ResultResponse | ResultPendingReview>(API.result.generate, { assessment_id: assessmentId })
      .then(r => {
        assertResultV2(r.data);
        return r.data;
      }),

  get: (assessmentId: string) =>
    apiClient
      .get<ResultResponse | ResultPendingReview>(API.result.get(assessmentId))
      .then(r => {
        assertResultV2(r.data);
        return r.data;
      }),
};
