import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { pairsApi } from '@/shared/api/pairs';
import { autofillPairAssessment } from '@/shared/dev/autofillPairAssessment';
import type { QuestionPair } from '@/shared/types';
import type { RestStopState } from '../utils/restStop';

export type PairAssessmentPhase = 'loading' | 'intro' | 'question';

export function usePairAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
  const setProgress = useAssessmentStore(s => s.setProgress);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

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

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    // Likert is banned for junior (TZ_Profi.md §13) — guard against a
    // middle/senior profile landing here via a typed-in URL.
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
          setError('Не удалось загрузить вопросы. Попробуй ещё раз.');
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
  }, [assessmentId, retryCount]);

  useEffect(() => {
    const pair = pairs[pairIndex];
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

      if (response.completed) {
        navigate('/assessment/motivation');
        return;
      }

      const isLast = pairIndex >= pairs.length - 1;
      if (isLast) {
        navigate('/assessment/motivation');
        return;
      }

      // "Привал" (rest stop) — at 25/50/75% of the whole assessment run.
      // See useAssessmentStore.recordQuestionAnswered.
      const restCheck = useAssessmentStore.getState().recordQuestionAnswered();
      if (restCheck.shouldShow) {
        navigate('/assessment/rest', {
          state: {
            returnTo: '/assessment/pairs',
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
    if (!assessmentId || autofilling) return;
    setAutofilling(true);
    setError(null);
    try {
      await autofillPairAssessment(assessmentId);
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
