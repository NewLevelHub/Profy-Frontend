import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useFinishedAssessmentGuard } from './useFinishedAssessmentGuard';
import { useEnsureProfile } from '@/shared/hooks/useEnsureProfile';
import { useDelayedFlag } from '@/shared/hooks/useDelayedFlag';
import { assessmentApi } from '@/shared/api/assessment';
import { pairsApi } from '@/shared/api/pairs';
import { autofillAssessment } from '@/shared/dev/autofillAssessment';
import { playBlockFinishAudio } from '@/shared/lib/sounds';
import { buildDisplaySequence } from '../utils/buildDisplaySequence';
import { buildPages, type Page } from '../utils/buildPages';
import type { RestStopState } from '../utils/restStop';

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
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
  const totalQuestionsFromStore = useAssessmentStore(s => s.totalQuestions);
  const setProgress = useAssessmentStore(s => s.setProgress);
  const { profile } = useEnsureProfile();
  const ageGroup = profile?.age_group;

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [pages, setPages] = useState<Page[]>([]);
  const [rawQuestionCount, setRawQuestionCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedPairOptionId, setSelectedPairOptionId] = useState<string | null>(null);
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

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
          // Each page consumes 1-5 (Likert) or 2 (pair) raw UserResponse
          // rows — walk until we've accounted for everything the store
          // says is already answered, landing on the first not-yet-fully-
          // answered page.
          let cumulative = 0;
          let startIndex = built.length > 0 ? built.length - 1 : 0;
          for (let i = 0; i < built.length; i++) {
            const page = built[i];
            const weight = page.kind === 'pair' ? 2 : page.questions.length;
            if (cumulative + weight > answeredCountFromStore) {
              startIndex = i;
              break;
            }
            cumulative += weight;
            startIndex = i;
          }
          setPageIndex(startIndex);
          if (answeredCountFromStore >= questions.length) {
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
          introTimerRef.current = setTimeout(() => {
            if (!cancelled) {
              sessionStorage.setItem(introKey, '1');
              setPhase('question');
            }
          }, 2000);
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить вопросы. Попробуй ещё раз.');
          setPhase('question');
        }
      }
    }

    loadSequence();

    return () => {
      cancelled = true;
      if (introTimerRef.current !== null) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, retryCount]);

  useEffect(() => {
    const page = pages[pageIndex];
    itemShownAtRef.current = Date.now();
    setSelectedPairOptionId(page?.kind === 'pair' ? (pairAnswers[page.pair.pair_index] ?? null) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    if (assessmentId) {
      sessionStorage.setItem(`profy-assessment-intro-seen:${assessmentId}`, '1');
    }
    setPhase('question');
  }

  function handleBack() {
    if (pageIndex === 0 || transitioning || saving) return;
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
      setError('Кажется, несколько ответов не сохранились — пройдём вопросы ещё раз, чтобы найти пропущенные.');
      setPageIndex(0);
      setSaving(false);
      return;
    }

    const { shouldShow, totalAnswered } = useAssessmentStore.getState().recordQuestionAnswered();
    if (shouldShow || isSpeedFlag) {
      // Route change unmounts this page, taking `saving` with it — no reset needed.
      navigate('/assessment/rest', {
        state: { returnTo: '/assessment', progress, totalAnswered, isSpeedFlag } satisfies RestStopState,
      });
      return;
    }

    setTransitioning(true);
    // Matches the wrapper's `transition-opacity duration-300` in
    // AssessmentPage.tsx — firing this before the CSS fade actually finishes
    // swapped in the next question while the old one was still ~1/6
    // visible, reading as a snap instead of a cross-fade.
    setTimeout(() => {
      setPageIndex(i => i + 1);
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
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
      setSaving(false);
    }
  }

  async function handlePairAnswer(pickedQuestionId: string) {
    const page = pages[pageIndex];
    if (!page || page.kind !== 'pair' || saving || transitioning) return;
    const { pair } = page;

    setSelectedPairOptionId(pickedQuestionId);
    setSaving(true);
    setError(null);

    try {
      const response = await pairsApi.submitAnswers(assessmentId!, {
        answers: [{ pair_index: pair.pair_index, picked_question_id: pickedQuestionId }],
      });
      setPairAnswers(prev => ({ ...prev, [pair.pair_index]: pickedQuestionId }));
      setProgress(response.answered_count, response.total);
      const isSpeedFlag = useAssessmentStore.getState().recordAnswerTiming(Date.now() - itemShownAtRef.current);

      if (response.completed) {
        playBlockFinishAudio(1, 1);
        navigate('/assessment/motivation');
        return;
      }
      advance(isSpeedFlag);
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
      setSaving(false);
    }
  }

  async function handleAutofill() {
    if (!assessmentId || autofilling) return;
    setAutofilling(true);
    setError(null);
    try {
      await autofillAssessment(assessmentId, ageGroup);
      navigate('/assessment/loading');
    } catch {
      setError('Не удалось автозаполнить тест.');
    } finally {
      setAutofilling(false);
    }
  }

  function handleExit() {
    setExitConfirmOpen(true);
  }

  async function confirmExit() {
    setExitConfirmOpen(false);
    // A Likert page only reaches the server on its "Далее" click
    // (handleSubmitLikertPage) — a page abandoned before that click never
    // sent anything, whether the user stopped partway through it or filled
    // every question on it and exited instead of pressing "Далее". So this
    // always flushes whatever's answered on the current page, not just a
    // partial one — resubmitting a page that *did* already get its "Далее"
    // click (e.g. after "Назад" back onto it) is a harmless no-op, same as
    // the resume-recovery path in advance() above relies on.
    // Pair pages don't have this gap: handlePairAnswer saves the single
    // choice the moment it's made, before this page can even be showing an
    // unsaved pick.
    const page = pages[pageIndex];
    if (assessmentId && page?.kind === 'likert') {
      const answeredQuestions = page.questions.filter(q => likertAnswers[q.id] !== undefined);
      if (answeredQuestions.length > 0) {
        setExiting(true);
        try {
          const response = await assessmentApi.saveAnswers(assessmentId, {
            answers: answeredQuestions.map(q => ({ question_id: q.id, value: likertAnswers[q.id] })),
          });
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
    }
    navigate('/results');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  const currentPage = pages[pageIndex];
  const currentLikertQuestions = currentPage?.kind === 'likert' ? currentPage.questions : undefined;
  const currentPair = currentPage?.kind === 'pair' ? currentPage.pair : undefined;
  const totalPages = pages.length;
  // "N вопросов" / time-estimate copy on the intro screen counts each
  // question and each pair as one unit, same as before pagination.
  const totalItems = pages.reduce((sum, p) => sum + (p.kind === 'pair' ? 1 : p.questions.length), 0);
  const progress = totalQuestionsFromStore > 0 ? (answeredCountFromStore / totalQuestionsFromStore) * 100 : 0;
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
    selectedPairOptionId,
    transitioning,
    saving,
    savingVisible,
    error,
    currentLikertQuestions,
    currentPair,
    progress,
    exitConfirmOpen,
    exiting,
    autofilling,
    handleBack,
    handleStartIntro,
    handleLikertSelect,
    handleSubmitLikertPage,
    handlePairAnswer,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
