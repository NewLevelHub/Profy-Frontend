import { useEffect } from 'react';
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
  const storedReportLocale = useResultStore(s => s.reportLocale);
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

  // Whether the stored report is usable for the current locale. A `null` tag
  // (report set by ResultLoadingPage straight after generation, before this
  // hook mounts) counts as a match — it was generated in the owner's language,
  // which is exactly what `reportLocale` settles to once LocaleGate adopts the
  // server preference. Only a *known, different* tag means we genuinely need
  // another locale's report — and even then we never tear the current one down
  // (see effectiveReport below), so a failed re-fetch can't blank the page.
  const reportMatchesLocale =
    report != null && (storedReportLocale === null || storedReportLocale === reportLocale);

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
    enabled: hasCompletedAssessment && !reportMatchesLocale && !!assessmentId,
    retry: (failureCount, err) => {
      if ((err as AxiosError)?.response?.status === 403) return false;
      if (err instanceof Error && err.message === 'legacy_result_shape') return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    // Adopt a report freshly fetched for the current locale, tagging it so a
    // later language switch is detected. Only runs when the stored one doesn't
    // already cover this locale — never overwrites a matching report.
    if (data && !reportMatchesLocale) setReport(data, reportLocale);
  }, [data, reportMatchesLocale, reportLocale, setReport]);

  // Stale assessmentId from a previous user's session — clear it
  const is403 = (error as AxiosError | null)?.response?.status === 403;
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  // Prefer a report that matches the current locale; otherwise show a
  // freshly-fetched one, falling back to the stale-locale report so a switch
  // (or a failed re-fetch after one) never leaves the page blank (KZ-406).
  const effectiveReport = (reportMatchesLocale ? report : null) ?? data ?? report ?? null;

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
      // A background failure while a (possibly stale-locale) report is still on
      // screen isn't worth an error state — the user keeps what they had.
      : (!is403 && error && !effectiveReport) ? t('error.loadResultsRetry') : null,
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
