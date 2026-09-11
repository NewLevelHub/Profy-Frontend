import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useFinishedAssessmentGuard } from './useFinishedAssessmentGuard';
import { useEnsureProfile } from '@/shared/hooks/useEnsureProfile';
import { pairsApi } from '@/shared/api/pairs';
import { autofillPairAssessment } from '@/shared/dev/autofillPairAssessment';
import type { QuestionPair } from '@/shared/types';
import type { RestStopState } from '../utils/restStop';

export type PairAssessmentPhase = 'loading' | 'intro' | 'question';

export function usePairAssessment() {
  useFinishedAssessmentGuard();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
  const setProgress = useAssessmentStore(s => s.setProgress);
  const { profile, isLoading: profileLoading } = useEnsureProfile();
  const ageGroup = profile?.age_group;

  const [phase, setPhase] = useState<PairAssessmentPhase>('loading');
  const [pairs, setPairs] = useState<QuestionPair[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [autofilling, setAutofilling] = useState(false);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startIndexApplied = useRef(false);
  // Reset whenever the current pair changes (see the effect below) —
  // elapsed time from here to handleAnswer feeds the speed-flag rest stop.
  const itemShownAtRef = useRef(Date.now());

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    // Likert is banned for junior (TZ_Profi.md §13) — guard against a
    // middle/senior profile landing here via a typed-in URL. Пока возраст
    // не известен, вывод «наверное, junior» делать нельзя: экран лежит вне
    // RequireProfile, и на холодной загрузке стор пуст — именно так middle
    // и попадал на junior-экран пар.
    if (profileLoading) return;
    if (ageGroup && ageGroup !== 'junior') {
      navigate('/assessment', { replace: true });
      return;
    }

    let cancelled = false;

    async function loadPairs() {
      setPhase('loading');
      setError(null);
      try {
        const data = await pairsApi.getPairs(assessmentId!);
        if (cancelled) return;
        if (data.length === 0) throw new Error('empty_pairs');
        setPairs(data);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          // answeredCountFromStore counts underlying UserResponse rows (2 per
          // answered pair, never partial) — divide to get the pair index.
          const startIndex = Math.min(Math.floor(answeredCountFromStore / 2), data.length - 1);
          setPairIndex(startIndex);
          if (startIndex >= data.length - 1 && answeredCountFromStore >= data.length * 2) {
            navigate('/assessment/motivation', { replace: true });
            return;
          }
        }

        setPhase('intro');
        introTimerRef.current = setTimeout(() => {
          if (!cancelled) setPhase('question');
        }, 2000);
      } catch {
        if (!cancelled) {
          setError(t('assessment:error.loadQuestions'));
          setPhase('question');
        }
      }
    }

    loadPairs();

    return () => {
      cancelled = true;
      if (introTimerRef.current !== null) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, retryCount, ageGroup, profileLoading]);

  useEffect(() => {
    const pair = pairs[pairIndex];
    itemShownAtRef.current = Date.now();
    setSelectedId(pair ? (answers[pair.pair_index] ?? null) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairIndex, pairs]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setPhase('question');
  }

  function handleBack() {
    if (pairIndex === 0 || transitioning || saving) return;
    setPairIndex(i => i - 1);
  }

  async function handleAnswer(pickedQuestionId: string) {
    const pair = pairs[pairIndex];
    if (!pair || saving || transitioning) return;

    setSelectedId(pickedQuestionId);
    setSaving(true);
    setError(null);

    try {
      const response = await pairsApi.submitAnswers(assessmentId!, {
        answers: [{ pair_index: pair.pair_index, picked_question_id: pickedQuestionId }],
      });
      setAnswers(prev => ({ ...prev, [pair.pair_index]: pickedQuestionId }));
      setProgress(response.answered_count, response.total);
      const isSpeedFlag = useAssessmentStore.getState().recordAnswerTiming(Date.now() - itemShownAtRef.current);

      if (response.completed) {
        navigate('/assessment/motivation');
        return;
      }

      const isLast = pairIndex >= pairs.length - 1;
      if (isLast) {
        navigate('/assessment/motivation');
        return;
      }

      // "Привал" (rest stop) — at 25/50/75% of the whole assessment run, or
      // as soon as the run-wide "too fast" ratio flags (see
      // recordAnswerTiming above). See useAssessmentStore.recordQuestionAnswered.
      const restCheck = useAssessmentStore.getState().recordQuestionAnswered();
      if (restCheck.shouldShow || isSpeedFlag) {
        navigate('/assessment/rest', {
          state: {
            returnTo: '/assessment/pairs',
            progress,
            totalAnswered: restCheck.totalAnswered,
            isSpeedFlag,
          } satisfies RestStopState,
        });
        return;
      }

      setTransitioning(true);
      // Matches the wrapper's `transition-opacity duration-300` in
      // PairAssessmentPage.tsx — see useAssessment.ts's advance() for why
      // this needs to match the CSS duration exactly.
      setTimeout(() => {
        setPairIndex(i => i + 1);
        setTransitioning(false);
        // Held true from the click through the fade-out and the pair swap —
        // releasing it right after the save request resolved (the old
        // `finally`) let the button flash back to idle mid-transition.
        setSaving(false);
      }, 300);
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
      await autofillPairAssessment(assessmentId);
      navigate('/assessment/loading');
    } catch {
      setError(t('assessment:error.autofill'));
    } finally {
      setAutofilling(false);
    }
  }

  function handleExit() {
    setExitConfirmOpen(true);
  }

  function confirmExit() {
    setExitConfirmOpen(false);
    navigate('/results');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  const currentPair = pairs[pairIndex];
  const totalPairs = pairs.length;
  const progress = totalPairs > 0 ? ((pairIndex + 1) / totalPairs) * 100 : 0;

  return {
    phase,
    pairIndex,
    totalPairs,
    selectedId,
    transitioning,
    saving,
    error,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleAnswer,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
