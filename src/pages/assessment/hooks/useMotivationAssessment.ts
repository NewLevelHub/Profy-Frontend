import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { assessmentApi } from '@/shared/api/assessment';
import { motivationApi } from '@/shared/api/motivation';
import type { MotivationTriplet } from '@/shared/types';

export type MotivationPhase = 'loading' | 'intro' | 'question';

interface Selection {
  most: string | null;
  least: string | null;
}

const EMPTY_SELECTION: Selection = { most: null, least: null };

export function useMotivationAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);

  const [phase, setPhase] = useState<MotivationPhase>('loading');
  const [triplets, setTriplets] = useState<MotivationTriplet[]>([]);
  const [tripletIndex, setTripletIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [answers, setAnswers] = useState<Record<number, Selection>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

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
    const saved = triplet ? answers[triplet.triplet_index] : undefined;
    setSelection(saved ?? EMPTY_SELECTION);
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

  function handleSelectMost(statementId: string) {
    if (saving || transitioning) return;
    setSelection(prev => ({
      most: prev.most === statementId ? null : statementId,
      least: prev.least === statementId ? null : prev.least,
    }));
  }

  function handleSelectLeast(statementId: string) {
    if (saving || transitioning) return;
    setSelection(prev => ({
      least: prev.least === statementId ? null : statementId,
      most: prev.most === statementId ? null : prev.most,
    }));
  }

  async function handleNext() {
    const triplet = triplets[tripletIndex];
    if (!triplet || !selection.most || !selection.least || saving || transitioning) return;

    setSaving(true);
    setError(null);

    try {
      const response = await motivationApi.submitAnswers(assessmentId!, {
        answers: [
          {
            triplet_index: triplet.triplet_index,
            most_statement_id: selection.most,
            least_statement_id: selection.least,
          },
        ],
      });
      setAnswers(prev => ({ ...prev, [triplet.triplet_index]: selection }));

      if (response.completed) {
        completeAssessment();
        navigate('/assessment/loading');
        return;
      }

      const isLast = tripletIndex >= triplets.length - 1;
      if (isLast) {
        // Shouldn't normally happen (completed should be true), but guard anyway.
        navigate('/assessment/loading');
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
  const canProceed = selection.most !== null && selection.least !== null;

  return {
    phase,
    tripletIndex,
    totalTriplets,
    selection,
    transitioning,
    saving,
    error,
    currentTriplet,
    canProceed,
    progress,
    exitConfirmOpen,
    handleBack,
    handleStartIntro,
    handleSelectMost,
    handleSelectLeast,
    handleNext,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
