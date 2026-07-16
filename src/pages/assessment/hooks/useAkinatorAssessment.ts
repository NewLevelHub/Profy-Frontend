import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { assessmentApi } from '@/shared/api/assessment';
import type {
  AkinatorTurnResponse,
  NextQuestionResponse,
  RevealLeaf,
  RevealResponse,
} from '@/shared/types';

export function useAkinatorAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [question, setQuestion] = useState<NextQuestionResponse | null>(null);
  const [reveal, setReveal] = useState<RevealResponse | null>(null);
  const [step, setStep] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  // RJP simulation entry point — set only by an explicit "Нравится" on a
  // reveal leaf (handleLikeLeaf), never automatically. Distinct from the
  // cluster resolver (isResolving), which is entered via handleResolve.
  const [simulatingLeaf, setSimulatingLeaf] = useState<RevealLeaf | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }

    let cancelled = false;

    async function startAkinator() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await assessmentApi.akinatorStart(assessmentId!);
        if (cancelled) return;
        if (data.type === 'next_question') {
          setQuestion(data);
          setReveal(null);
        } else {
          setReveal(data);
          setQuestion(null);
        }
        setStep(0);
        setIsResolving(false);
      } catch {
        if (!cancelled) {
          setError('Не удалось запустить тест. Попробуй ещё раз.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    startAkinator();

    return () => {
      cancelled = true;
    };
  }, [assessmentId, retryCount, navigate]);

  const handleOptionSelect = async (optionIndex: number | null) => {
    if (transitioning || saving || !question || !assessmentId) return;

    setSelectedIndex(optionIndex);
    setTransitioning(true);

    // Wait 300ms for smooth transition animation
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      let data;
      if (isResolving) {
        data = await assessmentApi.akinatorResolve(assessmentId, {
          question_id: question.question_id,
          selected_option_index: optionIndex,
        });
      } else {
        data = await assessmentApi.akinatorAnswer(assessmentId, {
          question_id: question.question_id,
          selected_option_index: optionIndex,
        });
      }

      if (data.type === 'next_question') {
        setQuestion(data);
        setReveal(null);
        setSelectedIndex(null);
        setStep(prev => prev + 1);
      } else {
        setReveal(data);
        setQuestion(null);
        setSelectedIndex(null);
      }
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleResolve = async () => {
    if (saving || !assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await assessmentApi.akinatorResolve(assessmentId, {});
      if (data.type === 'next_question') {
        setQuestion(data);
        setIsResolving(true);
        setReveal(null);
        setSelectedIndex(null);
        setStep(prev => prev + 1);
      } else {
        setReveal(data);
        setQuestion(null);
        setSelectedIndex(null);
      }
    } catch {
      setError('Не удалось начать уточнение результатов.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (slug: string) => {
    if (saving || !assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      const data = await assessmentApi.akinatorReject(assessmentId, slug);
      if (data.type === 'next_question') {
        setQuestion(data);
        setIsResolving(false);
        setReveal(null);
        setSelectedIndex(null);
        setStep(prev => prev + 1);
      } else {
        setReveal(data);
        setQuestion(null);
        setSelectedIndex(null);
      }
    } catch {
      setError('Не удалось исключить направление.');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async (
    liked: boolean,
    note: string | null = null,
    directionSlug?: string,
  ) => {
    if (saving || !assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      await assessmentApi.akinatorFeedback(assessmentId, { liked, note, direction_slug: directionSlug });
      completeAssessment();
      navigate('/assessment/praise', {
        state: {
          title: liked ? 'Отлично!' : 'Готово!',
          subtitle: liked ? 'Новые направления открыты!' : 'Твой выбор сохранён',
          nextPath: '/results',
          completedCount: 1,
          totalBlocks: 1,
        },
      });
    } catch {
      setError('Не удалось отправить отзыв. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleLikeLeaf = (leaf: RevealLeaf) => {
    setSimulatingLeaf(leaf);
  };

  const handleSimulationCancel = () => {
    setSimulatingLeaf(null);
  };

  // Accepting the simulation confirms the leaf — reuse the existing feedback
  // finalize step (liked=true), same as before the simulation screen existed.
  // Pass the simulated leaf's slug through so the backend finalizes THIS
  // leaf, not whichever one the engine currently believes in most — a
  // backup or a non-top cluster peer must stick when that's what got accepted.
  const handleSimulationAccept = async (note: string | null) => {
    const slug = simulatingLeaf?.slug;
    setSimulatingLeaf(null);
    await handleFeedback(true, note, slug);
  };

  // Rejecting the simulation feeds the outcome back into the akinator engine
  // (see submit_simulation_outcome on the backend, which demotes this leaf
  // and re-derives the turn) — merge whatever turn comes back exactly like
  // handleOptionSelect/handleReject do, so results reflect the rejection.
  const handleSimulationReject = (turn: AkinatorTurnResponse | null) => {
    setSimulatingLeaf(null);
    if (!turn) return;
    if (turn.type === 'next_question') {
      setQuestion(turn);
      setIsResolving(false);
      setReveal(null);
      setSelectedIndex(null);
      setStep(prev => prev + 1);
    } else {
      setReveal(turn);
      setQuestion(null);
      setSelectedIndex(null);
    }
  };

  // Converging indicator: starts fast and slowly approaches 100%, never reaching it.
  const questionProgress = 100 * (1 - Math.pow(0.85, step));

  return {
    assessmentId,
    isLoading,
    saving,
    error,
    question,
    reveal,
    step,
    isResolving,
    simulatingLeaf,
    selectedIndex,
    transitioning,
    exitConfirmOpen,
    questionProgress,
    ageGroup,
    handleOptionSelect,
    handleResolve,
    handleReject,
    handleFeedback,
    handleLikeLeaf,
    handleSimulationCancel,
    handleSimulationAccept,
    handleSimulationReject,
    handleExit: () => setExitConfirmOpen(true),
    confirmExit: () => {
      setExitConfirmOpen(false);
      navigate('/home');
    },
    cancelExit: () => setExitConfirmOpen(false),
    retry: () => setRetryCount(c => c + 1),
  };
}
