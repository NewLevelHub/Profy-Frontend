import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { afterBatteryRoute } from '@/shared/store/psychoemotional';
import { useFinishedAssessmentGuard } from './useFinishedAssessmentGuard';
import { useDelayedFlag } from '@/shared/hooks/useDelayedFlag';
import { useOnContentLocaleChange } from '@/shared/hooks/useContentLocale';
import { assessmentApi } from '@/shared/api/assessment';
import { pairsApi } from '@/shared/api/pairs';
import { autofillAssessment, autofillMainBattery, autofillToAstur } from '@/shared/dev/autofillAssessment';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { journeyStages } from '@/shared/lib/journeyProgress';
import { useAssessmentJourneyProgress } from './useAssessmentJourneyProgress';
import { buildDisplaySequence } from '../utils/buildDisplaySequence';
import { buildPages, isFirstPageOfInstrument, pageInstrument, pageItemCount, type Page } from '../utils/buildPages';
import type { RestStopState } from '../utils/restStop';
import type { Instrument, SavedAnswersResponse } from '@/shared/types';

// PRO-338 Ф0.8 — professional_types_abilities/eysenck/elers/boyko_empathy/
// kondash_anxiety land as one contiguous, non-interleaved sub-section right
// after MI/RIASEC/BigFive (app/services/question_service.py::
// get_all_questions, backed by the order ranges in scripts/
// {professional_types,eysenck,elers,boyko_empathy,kondash_anxiety}_bank.py)
// — the rail's section label switches to "Дополнительные тесты" for exactly
// this run of pages, distinguishing it from the main "Диагностика" block.
// boyko_empathy was missing here until Ф1.10 (its own Ф1.9 ticket shipped
// only the content bank, not this wiring) — fixed alongside adding
// kondash_anxiety. Belbin/АСТУР are deliberately never part of this list —
// they don't flow through this screen at all (own routes, launched only
// from the psychologist cabinet, see 01-Фаза0-Фундамент.md Ф0.8).
const ADDITIONAL_TESTS_INSTRUMENTS: ReadonlySet<Instrument> = new Set([
  'professional_types_abilities',
  'eysenck',
  'elers',
  'boyko_empathy',
  'kondash_anxiety',
]);

// Below this, a save reads as instant — showing a spinner for it would be
// the flash the button was glitching with, not a fix for it. Only a request
// that's actually slow crosses this and earns a spinner; see useDelayedFlag.
const SAVING_SPINNER_DELAY_MS = 250;

export type AssessmentPhase = 'loading' | 'intro' | 'question';

// Likert/pair picks live in local state, mirrored into sessionStorage (same
// pattern as the intro-seen flag below) so a remount within the tab — a
// rest stop, a reload — keeps picks not sent yet. What's already on the
// server comes back from GET saved-answers on load (loadSequence): a new
// tab or another device used to show every answered page blank on "Назад".
function likertAnswersStorageKey(assessmentId: string) {
  return `profy-assessment-likert-answers:${assessmentId}`;
}
function pairAnswersStorageKey(assessmentId: string) {
  return `profy-assessment-pair-answers:${assessmentId}`;
}

// One "seen" flag per (assessment, instrument) — same sessionStorage pattern
// as the top-level intro's own flag below. The battery is a single flat
// page sequence (buildDisplaySequence/buildPages), not separate routes per
// instrument, so there is no natural "have I been here before" signal other
// than this: a fresh forward crossing into an instrument that has never
// shown its own intro gets one. Coming back to it on purpose ("Назад" from
// its first page, or forward again after leaving it) reopens it through
// `reopenedIntro` instead (PRO-438).
function instrumentIntroSeenKey(assessmentId: string, instrument: Instrument) {
  return `profy-assessment-test-intro-seen:${assessmentId}:${instrument}`;
}

function loadStoredAnswers<T>(key: string | null): T | null {
  if (!key || typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * The number of stored rows is not a cursor: out-of-order writes can leave a
 * hole before a later answer. Resume from the first page that is not fully
 * represented in the server snapshot instead (PROFY-013).
 */
function firstUnansweredPageIndex(
  pages: Page[],
  saved: Pick<SavedAnswersResponse, 'question_values' | 'pair_picks'>,
): number | null {
  const index = pages.findIndex(page => {
    if (page.kind === 'likert') {
      return page.questions.some(question => saved.question_values[question.id] === undefined);
    }
    return page.pairs.some(pair => saved.pair_picks[pair.pair_index] === undefined);
  });
  return index === -1 ? null : index;
}

export function useAssessment() {
  useFinishedAssessmentGuard();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const setProgress = useAssessmentStore(s => s.setProgress);

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [pages, setPages] = useState<Page[]>([]);
  const [rawQuestionCount, setRawQuestionCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [likertAnswers, setLikertAnswers] = useState<Record<string, number>>(
    () => loadStoredAnswers(assessmentId ? likertAnswersStorageKey(assessmentId) : null) ?? {},
  );
  const [pairAnswers, setPairAnswers] = useState<Record<number, string>>(
    () => loadStoredAnswers(assessmentId ? pairAnswersStorageKey(assessmentId) : null) ?? {},
  );
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  // Mirrors instrumentIntroSeenKey's sessionStorage flags for reactivity —
  // sessionStorage writes alone don't trigger a re-render, so dismissing a
  // test-intro (markInstrumentIntroSeen below) also bumps this set.
  const [seenInstruments, setSeenInstruments] = useState<Set<Instrument>>(new Set());
  // PRO-438: a test's intro card brought back after it was already dismissed
  // — "Назад" from the test's first page, or a forward step into a test the
  // student had already started. Wins over the seen-once rule below.
  const [reopenedIntro, setReopenedIntro] = useState<Instrument | null>(null);

  const startIndexApplied = useRef(false);
  // What the server holds — saved-answers on load, then every successful
  // submit. A page whose picks all match it isn't re-sent on "Далее".
  const savedLikertRef = useRef<Record<string, number>>({});
  const savedPairsRef = useRef<Record<number, string>>({});
  // Reset whenever the current page changes (see the effect below) —
  // elapsed time from here to submit feeds the speed-flag rest stop.
  const itemShownAtRef = useRef(Date.now());

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }

    let cancelled = false;

    async function loadSequence() {
      setPhase('loading');
      setError(null);
      try {
        const [questions, pairs, saved] = await Promise.all([
          assessmentApi.getQuestions(assessmentId!),
          pairsApi.getPairs(assessmentId!),
          // Required for a safe resume: a total count cannot identify holes.
          assessmentApi.getSavedAnswers(assessmentId!),
        ]);
        if (cancelled) return;
        if (questions.length === 0) throw new Error('empty_questions');
        setRawQuestionCount(questions.length);
        // All Likert questions first, then all pairs (buildDisplaySequence),
        // then grouped into pages of up to 5 Likert questions / 5 pairs each.
        const built = buildPages(buildDisplaySequence(questions, pairs));
        setPages(built);
        if (saved) applySavedAnswers(built, saved);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          // Prefer the concrete server snapshot. A count of N only means N
          // rows exist; it does not prove that the first N display items are
          // the ones answered (two tabs / an old client can leave holes).
          const firstUnanswered = firstUnansweredPageIndex(built, saved);
          if (firstUnanswered === null) {
            // Likert+pairs phase already fully answered — motivation may
            // still be pending, so continue there rather than assuming the
            // whole test is done.
            navigate('/assessment/motivation', { replace: true });
            return;
          }

          const startIndex = firstUnanswered;
          setPageIndex(startIndex);
          // The instrument the student is about to land on skips its own
          // test-intro card when it's the very first one (covered by the
          // generic intro below) or one they were already mid-way through.
          // Landing exactly on a later test's first page (a rest stop or a
          // resume right at the boundary) still shows that test's card —
          // otherwise its instruction was skipped entirely (PRO-438).
          const startPage = built[startIndex];
          if (startPage && (startIndex === 0 || !isFirstPageOfInstrument(built, startIndex))) {
            const startInstrument = pageInstrument(startPage);
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem(instrumentIntroSeenKey(assessmentId!, startInstrument), '1');
            }
            setSeenInstruments(prev => new Set(prev).add(startInstrument));
          }
          // Tests before the landing page are already behind the student —
          // "Назад" into one of them lands on its pages, not on its card.
          // Without this, a remount (rest stop) forgot them and going back
          // popped the previous test's card (PRO-438).
          const passedInstruments = built.slice(0, startIndex).map(pageInstrument);
          if (passedInstruments.length > 0) {
            setSeenInstruments(prev => new Set([...prev, ...passedInstruments]));
          }
        }

        // Intro is a one-time "let's begin" moment — only on a genuinely
        // fresh start. A saved answer or a dismissed intro resumes directly
        // at the question selected above.
        const introKey = `profy-assessment-intro-seen:${assessmentId}`;
        const introAlreadySeen =
          typeof sessionStorage !== 'undefined' && sessionStorage.getItem(introKey) === '1';
        const hasSavedMainAnswers =
          Object.keys(saved.question_values).length > 0 || Object.keys(saved.pair_picks).length > 0;
        const testAlreadyStarted = hasSavedMainAnswers || introAlreadySeen;

        if (testAlreadyStarted) {
          setPhase('question');
        } else {
          setPhase('intro');
        }
      } catch {
        if (!cancelled) {
          setError(t('assessment:error.loadQuestions'));
          setPhase('question');
        }
      }
    }

    loadSequence();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, retryCount]);

  // A language switch mid-test (the rail's switcher) re-reads the texts and
  // swaps them in place. Not loadSequence again: that would flash the
  // loader and re-run the resume logic. Ids, order and paging don't depend
  // on the language, so the student stays on the same page with the same
  // picks; a failed or mismatched reload just keeps the current text.
  useOnContentLocaleChange(() => {
    if (!assessmentId || pages.length === 0) return;
    void Promise.all([assessmentApi.getQuestions(assessmentId), pairsApi.getPairs(assessmentId)])
      .then(([questions, pairs]) => {
        const rebuilt = buildPages(buildDisplaySequence(questions, pairs));
        setPages(current => (rebuilt.length === current.length ? rebuilt : current));
      })
      .catch(() => {});
  });

  useEffect(() => {
    itemShownAtRef.current = Date.now();
  }, [pageIndex, pages]);

  useEffect(() => {
    if (!assessmentId || typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(likertAnswersStorageKey(assessmentId), JSON.stringify(likertAnswers));
  }, [assessmentId, likertAnswers]);

  useEffect(() => {
    if (!assessmentId || typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(pairAnswersStorageKey(assessmentId), JSON.stringify(pairAnswers));
  }, [assessmentId, pairAnswers]);

  function applySavedAnswers(built: Page[], saved: SavedAnswersResponse) {
    const likert: Record<string, number> = {};
    const picks: Record<number, string> = {};
    for (const page of built) {
      if (page.kind === 'likert') {
        for (const q of page.questions) {
          if (saved.question_values[q.id] !== undefined) likert[q.id] = saved.question_values[q.id];
        }
      } else {
        for (const pair of page.pairs) {
          if (saved.pair_picks[pair.pair_index]) picks[pair.pair_index] = saved.pair_picks[pair.pair_index];
        }
      }
    }
    savedLikertRef.current = likert;
    savedPairsRef.current = picks;
    // The server wins where both have a pick: this tab's sessionStorage copy
    // may be older than an answer changed since from another tab or device,
    // and re-sending it would silently overwrite that. Picks not sent yet
    // aren't on the server, so they stay.
    setLikertAnswers(prev => ({ ...prev, ...likert }));
    setPairAnswers(prev => ({ ...prev, ...picks }));
  }

  /** "Назад" then "Далее" through a page the server already has unchanged —
   *  nothing to send, just move on. The last page is always sent: its
   *  response is what says the phase is complete. */
  function advanceIfUnchanged(unchanged: boolean) {
    if (!unchanged || pageIndex >= pages.length - 1) return false;
    setSaving(true);
    setError(null);
    advance();
    return true;
  }

  function handleStartIntro() {
    if (assessmentId) {
      sessionStorage.setItem(`profy-assessment-intro-seen:${assessmentId}`, '1');
    }
    setPhase('question');
  }

  // Dismisses the between-tests intro card (testIntroInstrument below) —
  // marks that instrument seen and closes a reopened card (PRO-438).
  function handleStartTestIntro(instrument: Instrument) {
    markInstrumentIntroSeen(instrument);
    setReopenedIntro(null);
  }

  function markInstrumentIntroSeen(instrument: Instrument) {
    if (assessmentId && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(instrumentIntroSeenKey(assessmentId, instrument), '1');
    }
    setSeenInstruments(prev => new Set(prev).add(instrument));
  }

  /**
   * PRO-438: "Назад" steps through a test's instruction, not past it — from
   * a test's first page it opens that test's intro card; from the card it
   * goes to the last page of the previous test. Answers are not lost on the
   * way: they stay in `likertAnswers` / sessionStorage.
   */
  function handleBack() {
    if (pageIndex === 0 || transitioning || saving) return;
    if (testIntroInstrument) {
      markInstrumentIntroSeen(testIntroInstrument);
      setReopenedIntro(null);
      setPageIndex(i => i - 1);
      return;
    }
    if (currentPage && isFirstPageOfInstrument(pages, pageIndex)) {
      setReopenedIntro(pageInstrument(currentPage));
      return;
    }
    setPageIndex(i => i - 1);
  }

  /**
   * Advances to the next page. Caller must have already updated the store's
   * progress (setProgress) for this submission — recordQuestionAnswered
   * checks the run-wide percentage against the 25/50/75% rest-stop
   * thresholds using whatever the store currently holds, see
   * useAssessmentStore.recordQuestionAnswered. `isSpeedFlag` is the result
   * of the caller's own recordAnswerTiming call for this same submission —
   * threaded through rather than recomputed here.
   */
  function advance(isSpeedFlag = false) {
    const isLast = pageIndex >= pages.length - 1;
    if (isLast) {
      // advance() is only reached after the caller already checked
      // response.completed === false, so the server is telling us this
      // phase genuinely isn't done — yet we're out of pages to show. That
      // means an earlier item is still missing. Use the exact saved IDs we
      // loaded and updated during this run to return directly to its page.
      const firstUnanswered = firstUnansweredPageIndex(pages, {
        question_values: savedLikertRef.current,
        pair_picks: savedPairsRef.current,
      });
      setError(t('assessment:error.answersLost'));
      // If local refs and the server disagree, page zero is the conservative
      // fallback and lets the student walk the sequence without skipping.
      setPageIndex(firstUnanswered ?? 0);
      setSaving(false);
      return;
    }

    const { shouldShow, totalAnswered } = useAssessmentStore.getState().recordQuestionAnswered();
    if (shouldShow || isSpeedFlag) {
      // Route change unmounts this page, taking `saving` with it — no reset needed.
      // Read progress from the store (just updated by setProgress) rather than
      // the stale render-time `progress` closed over this callback.
      const stages = journeyStages(useAssessmentStore.getState());
      navigate('/assessment/rest', {
        state: { returnTo: '/assessment', stages, totalAnswered, isSpeedFlag } satisfies RestStopState,
      });
      return;
    }

    // Stepping forward into a test the student already started (after going
    // back out of it) shows its instruction again — the seen-once rule only
    // covers the very first crossing. Applied with the page swap below, not
    // before it, so the card doesn't replace the page mid-fade.
    const next = pages[pageIndex + 1];
    const reopenNext =
      next && isFirstPageOfInstrument(pages, pageIndex + 1) && seenInstruments.has(pageInstrument(next))
        ? pageInstrument(next)
        : null;

    setTransitioning(true);
    // Matches the wrapper's `transition-opacity duration-300` in
    // AssessmentPage.tsx — firing this before the CSS fade actually finishes
    // swapped in the next question while the old one was still ~1/6
    // visible, reading as a snap instead of a cross-fade.
    setTimeout(() => {
      setPageIndex(i => i + 1);
      if (reopenNext) setReopenedIntro(reopenNext);
      setTransitioning(false);
      // Held true since the click, through the fade-out and the page swap —
      // releasing it earlier (e.g. right after the save request resolves,
      // as a `finally` on the caller used to) let the button flash back to
      // its idle state mid-transition, well before the next question was
      // actually on screen.
      setSaving(false);
    }, 300);
  }

  function handleLikertSelect(questionId: string, value: number) {
    if (saving || transitioning) return;
    setLikertAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmitLikertPage() {
    const page = pages[pageIndex];
    if (!page || page.kind !== 'likert' || saving || transitioning) return;
    const { questions } = page;
    if (!questions.every(q => likertAnswers[q.id] !== undefined)) return;
    if (advanceIfUnchanged(questions.every(q => savedLikertRef.current[q.id] === likertAnswers[q.id]))) return;

    setSaving(true);
    setError(null);

    try {
      const response = await assessmentApi.saveAnswers(assessmentId!, {
        answers: questions.map(q => ({ question_id: q.id, value: likertAnswers[q.id] })),
      });
      for (const q of questions) savedLikertRef.current[q.id] = likertAnswers[q.id];
      setProgress(response.answered_count, response.total);
      const isSpeedFlag = useAssessmentStore.getState().recordAnswerTiming(Date.now() - itemShownAtRef.current);

      if (response.completed) {
        // Likert+pairs phase done — seamlessly continue into the
        // motivation triplets, no results screen in between.
        playBlockFinishAudio(1, 1);
        navigate('/assessment/motivation');
        return;
      }
      advance(isSpeedFlag);
    } catch {
      setError(t('assessment:error.saveAnswer'));
      setSaving(false);
    }
  }

  function handlePairSelect(pairIndex: number, pickedQuestionId: string) {
    if (saving || transitioning) return;
    setPairAnswers(prev => ({ ...prev, [pairIndex]: pickedQuestionId }));
  }

  async function handleSubmitPairPage() {
    const page = pages[pageIndex];
    if (!page || page.kind !== 'pair' || saving || transitioning) return;
    const { pairs } = page;
    if (!pairs.every(pair => pairAnswers[pair.pair_index] !== undefined)) return;
    if (advanceIfUnchanged(pairs.every(pair => savedPairsRef.current[pair.pair_index] === pairAnswers[pair.pair_index]))) return;

    setSaving(true);
    setError(null);

    try {
      const response = await pairsApi.submitAnswers(assessmentId!, {
        answers: pairs.map(pair => ({ pair_index: pair.pair_index, picked_question_id: pairAnswers[pair.pair_index] })),
      });
      for (const pair of pairs) savedPairsRef.current[pair.pair_index] = pairAnswers[pair.pair_index];
      setProgress(response.answered_count, response.total);
      const isSpeedFlag = useAssessmentStore.getState().recordAnswerTiming(Date.now() - itemShownAtRef.current);

      if (response.completed) {
        playBlockFinishAudio(1, 1);
        navigate('/assessment/motivation');
        return;
      }
      advance(isSpeedFlag);
    } catch {
      setError(t('assessment:error.saveAnswer'));
      setSaving(false);
    }
  }

  async function handleAutofill() {
    if (!assessmentId || autofilling) return;
    setAutofilling(true);
    setError(null);
    try {
      await autofillAssessment(assessmentId);
      navigate(afterBatteryRoute(assessmentId));
    } catch {
      setError(t('assessment:error.autofill'));
    } finally {
      setAutofilling(false);
    }
  }

  // Stops right before motivation (unlike handleAutofill above, which races
  // through it too) — for testing the motivation screen itself by hand.
  async function handleAutofillToMotivation() {
    if (!assessmentId || autofilling) return;
    setAutofilling(true);
    setError(null);
    try {
      await autofillMainBattery(assessmentId);
      navigate('/assessment/motivation');
    } catch {
      setError(t('assessment:error.autofill'));
    } finally {
      setAutofilling(false);
    }
  }

  // Stops right before АСТУР (main battery + motivation + Belbin, unlike
  // handleAutofill above, which races through it too) — for testing the
  // АСТУР flow itself by hand.
  async function handleAutofillToAstur() {
    if (!assessmentId || autofilling) return;
    setAutofilling(true);
    setError(null);
    try {
      await autofillToAstur(assessmentId);
      navigate(`/assessment/astur/${assessmentId}`);
    } catch {
      setError(t('assessment:error.autofill'));
    } finally {
      setAutofilling(false);
    }
  }

  function handleExit() {
    setExitConfirmOpen(true);
  }

  /** Sends what's picked on the current page so far; null when nothing is. */
  function saveCurrentPagePicks() {
    const page = pages[pageIndex];
    if (!assessmentId || !page) return null;
    if (page.kind === 'likert') {
      const answered = page.questions.filter(q => likertAnswers[q.id] !== undefined);
      if (answered.length === 0) return null;
      return assessmentApi.saveAnswers(assessmentId, {
        answers: answered.map(q => ({ question_id: q.id, value: likertAnswers[q.id] })),
      });
    }
    const answered = page.pairs.filter(pair => pairAnswers[pair.pair_index] !== undefined);
    if (answered.length === 0) return null;
    return pairsApi.submitAnswers(assessmentId, {
      answers: answered.map(pair => ({ pair_index: pair.pair_index, picked_question_id: pairAnswers[pair.pair_index] })),
    });
  }

  async function confirmExit() {
    setExitConfirmOpen(false);
    // A page only reaches the server on its "Далее" click
    // (handleSubmitLikertPage / handleSubmitPairPage) — a page abandoned
    // before that click never sent anything, whether the user stopped
    // partway through it or filled every item on it and exited instead of
    // pressing "Далее". So this always flushes whatever's answered on the
    // current page, not just a partial one — resubmitting a page that *did*
    // already get its "Далее" click (e.g. after "Назад" back onto it) is a
    // harmless no-op, same as the resume-recovery path in advance() above
    // relies on.
    const request = saveCurrentPagePicks();
    if (request) {
      setExiting(true);
      try {
        const response = await request;
        setProgress(response.answered_count, response.total);
      } catch (err) {
        // Surfaced (not swallowed) so a failed flush is visible instead of
        // silently leaving the displayed count stale — answers stay
        // buffered in sessionStorage either way and retry next page load.
        console.error('[assessment] failed to flush answers on exit', err);
      } finally {
        setExiting(false);
      }
    }
    navigate('/results');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  const currentPage = pages[pageIndex];
  const currentLikertQuestions = currentPage?.kind === 'likert' ? currentPage.questions : undefined;
  const currentPairs = currentPage?.kind === 'pair' ? currentPage.pairs : undefined;
  const isAdditionalTestsSection =
    currentLikertQuestions?.some(q => ADDITIONAL_TESTS_INSTRUMENTS.has(q.instrument)) ?? false;
  // Between-tests card (post-Ф4.1 follow-up): a card reopened on purpose
  // (PRO-438, see handleBack / advance), or a genuine forward crossing
  // into an instrument this session hasn't dismissed the card for yet —
  // derived straight from render state (not an effect) so there's no
  // one-frame flash of the new instrument's questions first. The very
  // first instrument a student ever lands on is pre-marked seen above
  // (loadSequence) since the generic top-level AssessmentIntro already
  // covers it.
  const testIntroInstrument: Instrument | null =
    phase !== 'question' || !currentPage
      ? null
      : reopenedIntro ?? (!seenInstruments.has(pageInstrument(currentPage)) ? pageInstrument(currentPage) : null);
  const testIntroItemCount = testIntroInstrument
    ? pages.reduce((sum, p) => (pageInstrument(p) === testIntroInstrument ? sum + pageItemCount(p) : sum), 0)
    : 0;
  const totalPages = pages.length;
  // "N вопросов" / time-estimate copy on the intro screen counts each
  // question and each pair as one unit, same as before pagination.
  const totalItems = pages.reduce((sum, p) => sum + pageItemCount(p), 0);
  // Monotonic across all 4 phases — see journeyProgressPercent.
  const progress = useAssessmentJourneyProgress();
  // `saving` itself still gates input immediately (see handleLikertSelect /
  // handleBack above) — this is only for what the Button visually shows.
  const savingVisible = useDelayedFlag(saving, SAVING_SPINNER_DELAY_MS);

  return {
    phase,
    pageIndex,
    totalPages,
    totalItems,
    rawQuestionCount,
    likertAnswers,
    pairAnswers,
    transitioning,
    saving,
    savingVisible,
    error,
    currentLikertQuestions,
    currentPairs,
    isAdditionalTestsSection,
    testIntroInstrument,
    testIntroItemCount,
    progress,
    exitConfirmOpen,
    exiting,
    autofilling,
    handleBack,
    handleStartIntro,
    handleStartTestIntro,
    handleLikertSelect,
    handleSubmitLikertPage,
    handlePairSelect,
    handleSubmitPairPage,
    handleAutofill,
    handleAutofillToMotivation,
    handleAutofillToAstur,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
