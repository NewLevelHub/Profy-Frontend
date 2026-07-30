import { useEffect } from 'react';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';

/** useResultStore.report is persisted to localStorage keyed only by its
 * content, not by which assessment produced it — most "start a new
 * assessment" call sites never call clearReport() (only the explicit retake
 * handlers do), so a stale report from a previous assessment can survive
 * into a new one. Worse, every consumer gates its own refetch on `!report`
 * (skip fetching if something's already cached), so a stale-but-truthy
 * report doesn't just display wrong data — it also blocks the query that
 * would otherwise correct it.
 *
 * This guards every read site against both problems at once: a report is
 * only trusted when it belongs to the current assessmentId, and a mismatch
 * clears it immediately so nothing keeps blocking a fresh fetch. */
export function useValidatedReport() {
  const report = useResultStore(s => s.report);
  const clearReport = useResultStore(s => s.clearReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const isStale = report != null && report.assessment_id !== assessmentId;

  useEffect(() => {
    if (isStale) clearReport();
  }, [isStale, clearReport]);

  return isStale ? null : report;
}
