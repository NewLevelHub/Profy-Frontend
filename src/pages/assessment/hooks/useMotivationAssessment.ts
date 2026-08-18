import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';
import type { MotivationTriplet } from '@/shared/types';
import type { RestStopState } from '../utils/restStop';

export type MotivationPhase = 'loading' | 'intro' | 'question';

export function useMotivationAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const [phase, setPhase] = useState<MotivationPhase>('loading');
  const [triplets, setTriplets] = useState<MotivationTriplet[]>([]);
  const [tripletIndex, setTripletIndex] = useState(0);
  // Current triplet's card order, ids top→bottom: [0] = most, [last] = least.
  const [ranking, setRanking] = useState<string[]>([]);
  // True only once the user has actually dragged/keyboard-moved a card on
  // this triplet — a sortable list always has a syntactically valid order
  // from the moment it renders (the server's default), so without this gate
  // "Далее" could silently submit an order nobody actually chose.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
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
          motivationApi.getTriplets(assessmentId!),
        ]);
        if (cancelled) return;
        if (data.length === 0) throw new Error('empty_triplets');
        setTriplets(data);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          const startIndex = Math.min(current.motivation_answered_count, data.length - 1);
          setTripletIndex(startIndex);
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
    const triplet = triplets[tripletIndex];
    if (!triplet) return;
    const saved = answers[triplet.triplet_index];
    if (saved) {
      // Already answered — this order reflects a real decision, no need to
      // force a redrag on revisit.
      setRanking(saved);
      setHasInteracted(true);
    } else {
      setRanking([...triplet.statements].sort((a, b) => a.order - b.order).map(s => s.id));
      setHasInteracted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripletIndex, triplets]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setPhase('question');
  }

  function handleBack() {
    if (tripletIndex === 0 || transitioning || saving) return;
    setTripletIndex(i => i - 1);
  }

  function handleReorder(newRanking: string[]) {
    if (saving || transitioning) return;
    setRanking(newRanking);
    setHasInteracted(true);
  }

  async function handleNext() {
    const triplet = triplets[tripletIndex];
    if (!triplet || !canProceed || saving || transitioning) return;

    setSaving(true);
    setError(null);

    try {
      const response = await motivationApi.submitAnswers(assessmentId!, {
        answers: [
          {
            triplet_index: triplet.triplet_index,
            most_statement_id: ranking[0],
            least_statement_id: ranking[ranking.length - 1],
          },
        ],
      });
      setAnswers(prev => ({ ...prev, [triplet.triplet_index]: ranking }));
      useAssessmentStore.getState().setMotivationProgress(response.answered_count, response.total);

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

      const isLast = tripletIndex >= triplets.length - 1;
      if (isLast) {
        // Shouldn't normally happen (completed should be true), but guard anyway.
        navigate('/assessment/loading');
        return;
      }

      // "Привал" (rest stop) — at 25/50/75% of the whole assessment run.
      // See useAssessmentStore.recordQuestionAnswered.
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
        setTripletIndex(i => i + 1);
        setTransitioning(false);
      }, 250);
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAutofill() {
    if (!assessmentId || autofilling || triplets.length === 0) return;
    setAutofilling(true);
    setError(null);
    try {
      const response = await motivationApi.submitAnswers(assessmentId, {
        answers: triplets.map(t => {
          const shuffled = [...t.statements].sort(() => Math.random() - 0.5);
          return {
            triplet_index: t.triplet_index,
            most_statement_id: shuffled[0].id,
            least_statement_id: shuffled[shuffled.length - 1].id,
          };
        }),
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

  const currentTriplet = triplets[tripletIndex];
  const totalTriplets = triplets.length;
  const progress = totalTriplets > 0 ? ((tripletIndex + 1) / totalTriplets) * 100 : 0;
  const canProceed = hasInteracted && ranking.length === 3;
  const orderedStatements = currentTriplet
    ? ranking
        .map(id => currentTriplet.statements.find(s => s.id === id))
        .filter((s): s is MotivationTriplet['statements'][number] => s !== undefined)
    : [];

  return {
    phase,
    tripletIndex,
    totalTriplets,
    ranking,
    hasInteracted,
    orderedStatements,
    transitioning,
    saving,
    error,
    currentTriplet,
    canProceed,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleReorder,
    handleNext,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
