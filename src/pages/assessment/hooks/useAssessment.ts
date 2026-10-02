import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { afterBatteryRoute } from '@/shared/store/psychoemotional';
import { useFinishedAssessmentGuard } from './useFinishedAssessmentGuard';
import { useDelayedFlag } from '@/shared/hooks/useDelayedFlag';
import { assessmentApi } from '@/shared/api/assessment';
import { pairsApi } from '@/shared/api/pairs';
import { autofillAssessment, autofillMainBattery, autofillToAstur } from '@/shared/dev/autofillAssessment';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { journeyStages } from '@/shared/lib/journeyProgress';
import { useAssessmentJourneyProgress } from './useAssessmentJourneyProgress';
import { buildDisplaySequence } from '../utils/buildDisplaySequence';
import { buildPages, isFirstPageOfInstrument, pageInstrument, pageItemCount, type Page } from '../utils/buildPages';
import type { RestStopState } from '../utils/restStop';
import type { Instrument } from '@/shared/types';

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

// Likert/pair answers already saved to the server are only known to this
// hook via local state — the questions endpoint doesn't echo previous
// values back. A rest stop (or any other route change away from
// /assessment) unmounts this hook and would otherwise wipe that buffer, so
// going "Назад" past a rest-stop boundary made earlier selections vanish
// even though they were saved fine. Mirroring these two maps into
// sessionStorage (same pattern as the intro-seen flag below) survives
// remounts within the same tab.
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

export function useAssessment() {
  useFinishedAssessmentGuard();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
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
        const [questions, pairs] = await Promise.all([
          assessmentApi.getQuestions(assessmentId!),
          pairsApi.getPairs(assessmentId!),
        ]);
        if (cancelled) return;
        if (questions.length === 0) throw new Error('empty_questions');
        setRawQuestionCount(questions.length);
        // All Likert questions first, then all pairs (buildDisplaySequence),
        // then grouped into pages of up to 5 Likert questions / 1 pair each.
        const built = buildPages(buildDisplaySequence(questions, pairs));
        setPages(built);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          // Each page consumes 1-5 (Likert) or 2 per pair raw UserResponse
          // rows — walk until we've accounted for everything the store
          // says is already answered, landing on the first not-yet-fully-
          // answered page.
          let cumulative = 0;
          let startIndex = built.length > 0 ? built.length - 1 : 0;
          for (let i = 0; i < built.length; i++) {
            const page = built[i];
            const weight = page.kind === 'pair' ? page.pairs.length * 2 : page.questions.length;
            if (cumulative + weight > answeredCountFromStore) {
              startIndex = i;
              break;
            }
            cumulative += weight;
            startIndex = i;
          }
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
          const sequenceAnswerCount = questions.length + pairs.length * 2;
          if (answeredCountFromStore >= sequenceAnswerCount) {
            // Likert+pairs phase already fully answered — motivation may
            // still be pending, so continue there rather than assuming the
            // whole test is done.
            navigate('/assessment/motivation', { replace: true });
            return;
          }
        }

        // Intro is a one-time "let's begin" moment — only on a genuinely
        // fresh start. Reload / resume always has answeredCount > 0 (or the
        // intro already dismissed this session), so skip straight to questions.
        const introKey = `profy-assessment-intro-seen:${assessmentId}`;
        const introAlreadySeen =
          typeof sessionStorage !== 'undefined' && sessionStorage.getItem(introKey) === '1';
        const testAlreadyStarted = answeredCountFromStore > 0 || introAlreadySeen;

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
      // means some raw question/pair is unanswered somewhere OTHER than
      // where we currently are (e.g. a resume computed against a display
      // order that changed since some answers were recorded, so its
      // "first N are answered" assumption no longer holds). We have no way
      // to know which item that is — there's no per-item answered flag in
      // the API — so the only safe recovery is to walk the whole sequence
      // again from the top: re-submitting already-answered items is a
      // harmless no-op, and whatever was actually skipped will surface
      // this pass.
      setError(t('assessment:error.answersLost'));
      setPageIndex(0);
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

    setSaving(true);
    setError(null);

    try {
      const response = await assessmentApi.saveAnswers(assessmentId!, {
        answers: questions.map(q => ({ question_id: q.id, value: likertAnswers[q.id] })),
      });
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

    setSaving(true);
    setError(null);

    try {
      const response = await pairsApi.submitAnswers(assessmentId!, {
        answers: pairs.map(pair => ({ pair_index: pair.pair_index, picked_question_id: pairAnswers[pair.pair_index] })),
      });
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
