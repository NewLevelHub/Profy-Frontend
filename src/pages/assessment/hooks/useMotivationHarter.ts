import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { assessmentApi } from '@/shared/api/assessment';
import { motivationPairsApi } from '@/shared/api/motivationPairs';
import type { MotivationIntensity, MotivationPairItem, MotivationPairSide } from '@/shared/types';
import type { RestStopState } from '../utils/restStop';

export type MotivationHarterPhase = 'loading' | 'intro' | 'question';

interface Answer {
  side: MotivationPairSide;
  intensity: MotivationIntensity;
}

export function useMotivationHarter() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const [phase, setPhase] = useState<MotivationHarterPhase>('loading');
  const [pairs, setPairs] = useState<MotivationPairItem[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [chosenSide, setChosenSide] = useState<MotivationPairSide | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [autofilling, setAutofilling] = useState(false);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startIndexApplied = useRef(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }

    let cancelled = false;

    async function load() {
      setPhase('loading');
      setError(null);
      try {
        const [current, data] = await Promise.all([
          assessmentApi.current(),
          motivationPairsApi.getPairs(assessmentId!),
        ]);
        if (cancelled) return;
        if (data.length === 0) throw new Error('empty_pairs');
        setPairs(data);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          const startIndex = Math.min(current.motivation_answered_count, data.length - 1);
          setPairIndex(startIndex);
          if (startIndex >= data.length - 1 && current.motivation_answered_count >= data.length) {
            navigate('/assessment/loading', { replace: true });
            return;
          }
        }

        // Intro screen is a one-time "let's begin" moment — only show it on
        // a genuinely fresh start (nothing answered yet). Resuming later
        // (rest stop, closed tab, etc.) always has motivation_answered_count
        // > 0 by then, so it goes straight to the question.
        if (current.motivation_answered_count === 0) {
          setPhase('intro');
          introTimerRef.current = setTimeout(() => {
            if (!cancelled) setPhase('question');
          }, 2000);
        } else {
          setPhase('question');
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить вопросы. Попробуй ещё раз.');
          setPhase('question');
        }
      }
    }

    load();

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
    const pair = pairs[pairIndex];
    const saved = pair ? answers[pair.pair_index] : undefined;
    setChosenSide(saved?.side ?? null);
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

  function handleSelectSide(side: MotivationPairSide) {
    if (saving || transitioning) return;
    setChosenSide(side);
  }

  async function handleSelectIntensity(intensity: MotivationIntensity) {
    const pair = pairs[pairIndex];
    if (!pair || !chosenSide || saving || transitioning) return;

    setSaving(true);
    setError(null);

    try {
      const response = await motivationPairsApi.submitAnswers(assessmentId!, {
        answers: [{ pair_index: pair.pair_index, chosen_side: chosenSide, intensity }],
      });
      setAnswers(prev => ({ ...prev, [pair.pair_index]: { side: chosenSide, intensity } }));

      if (response.completed) {
        // Don't call completeAssessment() here — that flag means "report
        // generated", not "questions answered". Setting it early makes
        // ResultLoadingPage take its "already have a report" shortcut
        // (straight to /results, skipping the loading animation and
        // goal-check) before a report exists. ResultLoadingPage sets it
        // itself once resultApi.generate() actually succeeds.
        navigate('/assessment/loading');
        return;
      }

      const isLast = pairIndex >= pairs.length - 1;
      if (isLast) {
        navigate('/assessment/loading');
        return;
      }

      // "Привал" (rest stop) — every 10-12 raw questions answered across the
      // whole assessment run. See useAssessmentStore.recordQuestionAnswered.
      const restCheck = useAssessmentStore.getState().recordQuestionAnswered();
      if (restCheck.shouldShow) {
        navigate('/assessment/rest', {
          state: {
            returnTo: '/assessment/motivation',
            progress,
            totalAnswered: restCheck.totalAnswered,
          } satisfies RestStopState,
        });
        return;
      }

      setTransitioning(true);
      setTimeout(() => {
        setPairIndex(i => i + 1);
        setTransitioning(false);
      }, 250);
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAutofill() {
    if (!assessmentId || autofilling || pairs.length === 0) return;
    setAutofilling(true);
    setError(null);
    try {
      const response = await motivationPairsApi.submitAnswers(assessmentId, {
        answers: pairs.map(p => ({
          pair_index: p.pair_index,
          chosen_side: Math.random() < 0.5 ? 'a' : 'b',
          intensity: Math.random() < 0.5 ? 'high' : 'medium',
        })),
      });
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

  function confirmExit() {
    setExitConfirmOpen(false);
    navigate('/home');
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
    chosenSide,
    transitioning,
    saving,
    error,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleSelectSide,
    handleSelectIntensity,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
