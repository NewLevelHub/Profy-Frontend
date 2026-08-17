import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { assessmentApi } from '@/shared/api/assessment';
import { pairsApi } from '@/shared/api/pairs';
import { autofillAssessment } from '@/shared/dev/autofillAssessment';
import { LIKERT_SCALE, BIGFIVE_LIKERT_SCALE } from '@/shared/config/constants';
import { buildDisplaySequence, type DisplayItem } from '../utils/buildDisplaySequence';
import type { RestStopState } from '../utils/restStop';

export type AssessmentPhase = 'loading' | 'intro' | 'question';

export function useAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
  const setProgress = useAssessmentStore(s => s.setProgress);
  const ageGroup = useProfileStore(s => s.profile?.age_group);

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [sequence, setSequence] = useState<DisplayItem[]>([]);
  const [rawQuestionCount, setRawQuestionCount] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedPairOptionId, setSelectedPairOptionId] = useState<string | null>(null);
  const [likertAnswers, setLikertAnswers] = useState<Record<string, number>>({});
  const [pairAnswers, setPairAnswers] = useState<Record<number, string>>({});
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
        const built = buildDisplaySequence(questions, pairs);
        setSequence(built);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          // Each sequence item consumes 1 (likert) or 2 (pair) raw
          // UserResponse rows — walk until we've accounted for everything
          // the store says is already answered, landing on the first
          // not-yet-answered item.
          let cumulative = 0;
          let startIndex = built.length > 0 ? built.length - 1 : 0;
          for (let i = 0; i < built.length; i++) {
            const weight = built[i].kind === 'pair' ? 2 : 1;
            if (cumulative + weight > answeredCountFromStore) {
              startIndex = i;
              break;
            }
            cumulative += weight;
            startIndex = i;
          }
          setItemIndex(startIndex);
          if (answeredCountFromStore >= questions.length) {
            // Likert+pairs phase already fully answered — motivation may
            // still be pending, so continue there rather than assuming the
            // whole test is done.
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
    const item = sequence[itemIndex];
    if (!item) {
      setSelectedValue(null);
      setSelectedPairOptionId(null);
    } else if (item.kind === 'likert') {
      setSelectedValue(likertAnswers[item.question.id] ?? null);
      setSelectedPairOptionId(null);
    } else {
      setSelectedPairOptionId(pairAnswers[item.pair.pair_index] ?? null);
      setSelectedValue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIndex, sequence]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setPhase('question');
  }

  function handleBack() {
    if (itemIndex === 0 || transitioning || saving) return;
    setItemIndex(i => i - 1);
  }

  function advance() {
    const isLast = itemIndex >= sequence.length - 1;
    if (isLast) {
      navigate('/assessment/motivation');
      return;
    }

    // "Привал" (rest stop) — every 10-12 raw questions answered across the
    // whole assessment run, independent of block boundaries. See
    // useAssessmentStore.recordQuestionAnswered for the cadence logic.
    const { shouldShow, totalAnswered } = useAssessmentStore.getState().recordQuestionAnswered();
    if (shouldShow) {
      navigate('/assessment/rest', {
        state: { returnTo: '/assessment', progress, totalAnswered } satisfies RestStopState,
      });
      return;
    }

    setTransitioning(true);
    setTimeout(() => {
      setItemIndex(i => i + 1);
      setTransitioning(false);
    }, 250);
  }

  async function handleAnswer(value: number) {
    const item = sequence[itemIndex];
    if (!item || item.kind !== 'likert' || saving || transitioning) return;
    const question = item.question;

    setSelectedValue(value);
    setSaving(true);
    setError(null);

    try {
      const response = await assessmentApi.saveAnswers(assessmentId!, {
        answers: [{ question_id: question.id, value }],
      });
      setLikertAnswers(prev => ({ ...prev, [question.id]: value }));
      setProgress(response.answered_count, response.total);

      if (response.completed) {
        // Likert+pairs phase done — seamlessly continue into the
        // motivation triplets, no results screen in between.
        navigate('/assessment/motivation');
        return;
      }
      advance();
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePairAnswer(pickedQuestionId: string) {
    const item = sequence[itemIndex];
    if (!item || item.kind !== 'pair' || saving || transitioning) return;
    const pair = item.pair;

    setSelectedPairOptionId(pickedQuestionId);
    setSaving(true);
    setError(null);

    try {
      const response = await pairsApi.submitAnswers(assessmentId!, {
        answers: [{ pair_index: pair.pair_index, picked_question_id: pickedQuestionId }],
      });
      setPairAnswers(prev => ({ ...prev, [pair.pair_index]: pickedQuestionId }));
      setProgress(response.answered_count, response.total);

      if (response.completed) {
        navigate('/assessment/motivation');
        return;
      }
      advance();
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

  function confirmExit() {
    setExitConfirmOpen(false);
    navigate('/home');
  }

  function cancelExit() {
    setExitConfirmOpen(false);
  }

  const currentItem = sequence[itemIndex];
  const currentQuestion = currentItem?.kind === 'likert' ? currentItem.question : undefined;
  const currentPair = currentItem?.kind === 'pair' ? currentItem.pair : undefined;
  const totalItems = sequence.length;
  const progress = totalItems > 0 ? ((itemIndex + 1) / totalItems) * 100 : 0;
  const currentScale = useMemo(
    () => (currentQuestion?.instrument === 'big_five' ? BIGFIVE_LIKERT_SCALE : LIKERT_SCALE),
    [currentQuestion],
  );

  return {
    phase,
    itemIndex,
    totalItems,
    rawQuestionCount,
    selectedValue,
    selectedPairOptionId,
    currentScale,
    transitioning,
    saving,
    error,
    currentQuestion,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleAnswer,
    handlePairAnswer,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
