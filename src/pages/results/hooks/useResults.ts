import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { isPendingReview, resultApi } from '@/shared/api/result';
import { useResultStore } from '@/shared/store/result';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useLocaleStore } from '@/shared/store/locale';
import { hasPendingColorRun } from '@/shared/store/psychoemotional';
import { journeyProgressPercent } from '@/shared/lib/journeyProgress';

export function useResults() {
  const { t } = useTranslation('results');
  const report = useResultStore(s => s.report);
  const storedReportLocale = useResultStore(s => s.reportLocale);
  const setReport = useResultStore(s => s.setReport);
  const clearReport = useResultStore(s => s.clearReport);
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const hasCompletedAssessmentFlag = useAssessmentStore(s => s.hasCompletedAssessment);
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const goal = useAssessmentStore(s => s.goal);
  const answeredCount = useAssessmentStore(s => s.answeredCount);
  const totalQuestions = useAssessmentStore(s => s.totalQuestions);
  const motivationAnsweredCount = useAssessmentStore(s => s.motivationAnsweredCount);
  const motivationTotal = useAssessmentStore(s => s.motivationTotal);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  // Defensive re-check against the store's own live progress counters,
  // mirroring the backend's own completion definition (report_service's
  // `_assert_assessment_complete`: Likert done AND motivation done). The
  // persisted `hasCompletedAssessment` flag has fewer write sites than these
  // counters (which update on every single answer via setProgress/
  // setMotivationProgress) and can go stale — e.g. a leftover `true` from an
  // earlier fully-completed attempt surviving into a new, still in-progress
  // one. Trusting the flag alone then sends a student who "saved and exited"
  // mid-test straight to the "report is pending review" screen instead of
  // the correct "continue where you left off" card. Requiring the counters
  // to actually agree makes that self-healing regardless of what caused the
  // flag to drift.
  const hasCompletedAssessment =
    hasCompletedAssessmentFlag &&
    totalQuestions > 0 && answeredCount >= totalQuestions &&
    motivationTotal > 0 && motivationAnsweredCount >= motivationTotal;
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

  // Whether the stored report belongs to this assessment *and* locale. A
  // retake creates a new assessment_id (PRO-337): without that check the
  // previous published report stays on screen, the query stays disabled, and
  // the pending-review waiting state never appears. Locale tagging still
  // drives re-fetch on a language switch (KZ-406). A `null` locale tag is a
  // transient default — treat it as matching so it doesn't force a spurious
  // re-fetch before the real tag lands.
  const reportMatchesAssessment =
    report != null && assessmentId != null && report.assessment_id === assessmentId;
  const reportMatchesLocale =
    reportMatchesAssessment &&
    (storedReportLocale === null || storedReportLocale === reportLocale);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    // The optional psych-block sections (validity/psychoemotional, PRO-292)
    // travel inside the same /result payload and must NOT widen this key
    // further — their composition doesn't identify a different resource.
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
    // The report waits for a psychologist to publish it (PRO-337) — poll so
    // the student sees it without reloading, on top of the email they get.
    refetchInterval: (query) => (isPendingReview(query.state.data) ? 60_000 : false),
  });

  // The pending-review envelope is only this hook's return value — it never
  // goes into the result store, which stays typed as a real report.
  const pendingReview = isPendingReview(data);
  const fetchedReport = data && !isPendingReview(data) ? data : null;

  useEffect(() => {
    // Drop a leftover report from another assessment (retake) so it can't
    // keep masking the pending-review state via the effectiveReport fallback.
    if (report != null && assessmentId != null && report.assessment_id !== assessmentId) {
      clearReport();
    }
  }, [report, assessmentId, clearReport]);

  useEffect(() => {
    // Adopt a report freshly fetched for the current locale, tagging it so a
    // later language switch is detected. Only runs when the stored one doesn't
    // already cover this locale — never overwrites a matching report.
    if (fetchedReport && !reportMatchesLocale) setReport(fetchedReport, reportLocale);
  }, [fetchedReport, reportMatchesLocale, reportLocale, setReport]);

  // Stale assessmentId from a previous user's session — clear it
  const is403 = (error as AxiosError | null)?.response?.status === 403;
  useEffect(() => {
    if (is403) {
      resetAssessment();
      clearReport();
    }
  }, [is403, resetAssessment, clearReport]);

  // Prefer a report that matches this assessment + locale; otherwise show a
  // freshly-fetched one, falling back to the same-assessment stale-locale
  // report so a language switch (or a failed re-fetch) never blanks the page
  // (KZ-406). Never fall back to another assessment's report (PRO-337).
  const effectiveReport =
    (reportMatchesLocale ? report : null) ??
    fetchedReport ??
    (reportMatchesAssessment ? report : null) ??
    null;

  // A finished report is on screen but still in the previous language, and
  // the query for the newly-picked locale is in flight. The backend is
  // translating the *existing* narrative (report_service._build_narrative →
  // translate_report_narrative) — only the four AI-authored text fields
  // (summary, strength_cards, thinking_style_notes, final_analysis) change;
  // every other section re-resolves from the i18n catalog. The results page
  // keeps the report readable and marks just those fields as updating.
  const isTranslating = !!effectiveReport && !reportMatchesLocale && isFetching;

  // Backend returned the pre-v2 admin/raw AnalysisResult shape for this
  // assessment (see resultApi.assertResultV2) — retrying won't help since
  // `/result/generate` reuses the existing stored row rather than
  // recomputing it; this needs a backend-side regeneration/backfill.
  const isLegacyShape = error instanceof Error && error.message === 'legacy_result_shape';

  // Psych-block slots (PRO-292) — pulled off the report here so the page
  // stays assembly-only. Every entry is `null` until its phase ships on the
  // backend (psychoemotional → Фаза 2).
  const psychSections = {
    psychoemotional: effectiveReport?.psychoemotional ?? null,
  };
  const hasPsychSections = !!psychSections.psychoemotional;

  const belbinCompleted = useAssessmentStore(s => s.belbinCompleted);
  const asturCompleted = useAssessmentStore(s => s.asturCompleted);

  // The whole test is 4 phases (Likert+pairs -> motivation -> Belbin ->
  // АСТУР — see assessment_shared.try_complete_assessment on the backend for
  // the matching definition), not just the Likert block. Progress on the
  // in-progress card is the monotonic journey percentage (each phase 25%)
  // so mid-diagnostic no longer reads as a stuck 0%, and finishing Likert
  // alone no longer reads as 100%/done.
  const likertDone = totalQuestions > 0 && answeredCount >= totalQuestions;
  const motivationDone = motivationTotal > 0 && motivationAnsweredCount >= motivationTotal;
  const completedPhaseCount = [likertDone, motivationDone, belbinCompleted, asturCompleted].filter(Boolean).length;
  const totalPhaseCount = 4;
  const journeyProgress = journeyProgressPercent({
    answeredCount,
    totalQuestions,
    motivationAnsweredCount,
    motivationTotal,
    belbinCompleted,
    asturCompleted,
  });

  type AssessmentPhase = 'diagnostic' | 'motivation' | 'belbin' | 'astur' | 'done';
  let currentPhase: AssessmentPhase = 'diagnostic';
  
  // Circle 1 (psychoemotional-start) sits before the main diagnostic phase. If
  // it hasn't been started yet (no runId), route there first. hasPendingColorRun
  // is true if circle 1 is already submitted.
  let continueRoute = !likertDone && assessmentId && !hasPendingColorRun(assessmentId)
    ? '/assessment/psychoemotional-start'
    : '/assessment';

  if (likertDone) {
    if (!motivationDone) {
      currentPhase = 'motivation';
      continueRoute = '/assessment/motivation';
    } else if (!belbinCompleted) {
      currentPhase = 'belbin';
      continueRoute = assessmentId ? `/assessment/belbin/${assessmentId}` : '/assessment/belbin';
    } else if (!asturCompleted) {
      currentPhase = 'astur';
      continueRoute = assessmentId ? `/assessment/astur/${assessmentId}` : '/assessment/astur';
    } else {
      currentPhase = 'done';
      continueRoute = '/assessment/loading';
    }
  }

  return {
    report: effectiveReport,
    psychSections,
    hasPsychSections,
    isLoading: isLoading && !effectiveReport,
    isTranslating,
    isPendingReview: pendingReview && !effectiveReport,
    error: isLegacyShape
      ? t('error.legacyShape')
      // A background failure while a (possibly stale-locale) report is still on
      // screen isn't worth an error state — the user keeps what they had.
      : (!is403 && error && !effectiveReport) ? t('error.loadResultsRetry') : null,
    hasCompletedAssessment,
    assessmentId,
    goal,
    ageGroup,
    refetch,
    hasAssessment,
    inProgress,
    answeredCount,
    totalQuestions,
    completedPhaseCount,
    totalPhaseCount,
    journeyProgress,
    currentPhase,
    continueRoute,
  };
}
