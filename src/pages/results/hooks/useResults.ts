import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { resultApi } from '@/shared/api/result';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useLocaleStore } from '@/shared/store/locale';

export function useResults() {
  const { t } = useTranslation('results');
  const report = useResultStore(s => s.report);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const goal = useAssessmentStore(s => s.goal);
  const answeredCount = useAssessmentStore(s => s.answeredCount);
  const totalQuestions = useAssessmentStore(s => s.totalQuestions);
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  // The report is generated in the *owner's* language (backend derives it from
  // users.locale — KZ-403/405), which the locale store mirrors after login
  // (LocaleGate). The raw stored value can be 'kk' while the UI is still
  // clamped to 'ru' pre-KZ-603 — that's fine, this is only a cache key. When
  // the student switches language, this changes and the query below re-fetches;
  // GET /result 404s (no row for the new locale) and the queryFn transparently
  // POSTs /generate — the same lazy path used for the very first generation.
  const reportLocale = useLocaleStore(s => s.locale);

  // No completed report yet — either no assessment was ever started, or one
  // is started but not finished. /results is now the only screen for both
  // states (the old separate /home "overview" showed nothing useful before
  // the report existed anyway).
  const hasAssessment = assessmentId !== null && goal !== null;
  const inProgress = hasAssessment && !hasCompletedAssessment;

  // Drop the stale-locale report the moment the language *changes* (not on
  // mount) so the now-different-locale query result isn't shadowed by
  // `report ?? data`.
  const prevLocaleRef = useRef(reportLocale);
  useEffect(() => {
    if (prevLocaleRef.current !== reportLocale) {
      prevLocaleRef.current = reportLocale;
      clearReport();
    }
  }, [reportLocale, clearReport]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['result', assessmentId, reportLocale] as const,
    queryFn: async () => {
      try {
        return await resultApi.get(assessmentId!);
      } catch (err) {
        if ((err as AxiosError)?.response?.status === 404) {
          return await resultApi.generate(assessmentId!);
        }
        throw err;
      }
    },
    enabled: hasCompletedAssessment && !report && !!assessmentId,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 403) return false;
      if (err instanceof Error && err.message === 'legacy_result_shape') return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (data && !report) setReport(data);
  }, [data, report, setReport]);

  // Stale assessmentId from a previous user's session — clear it
  const is403 = (error as AxiosError | null)?.response?.status === 403;
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  const effectiveReport = report ?? data ?? null;

  // interest_instrument is the ONLY field the result-v2 contract (§3) allows
  // for branching mi/riasec — never age group, array length, or `code`
  // (there is no `code` in this contract at all).
  const isJunior = effectiveReport?.interest_instrument === 'mi';

  // Backend returned the pre-v2 admin/raw AnalysisResult shape for this
  // assessment (see resultApi.assertResultV2) — retrying won't help since
  // `/result/generate` reuses the existing stored row rather than
  // recomputing it; this needs a backend-side regeneration/backfill.
  const isLegacyShape = error instanceof Error && error.message === 'legacy_result_shape';

  return {
    report: effectiveReport,
    isLoading: isLoading && !effectiveReport,
    error: isLegacyShape
      ? t('error.legacyShape')
      : (!is403 && error) ? t('error.loadResultsRetry') : null,
    hasCompletedAssessment,
    assessmentId,
    goal,
    ageGroup,
    isJunior,
    refetch,
    hasAssessment,
    inProgress,
    answeredCount,
    totalQuestions,
  };
}
