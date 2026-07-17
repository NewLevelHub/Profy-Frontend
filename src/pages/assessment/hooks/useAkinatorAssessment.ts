import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { useResultStore } from '@/shared/store/result';
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
  const resetAssessment = useAssessmentStore(s => s.resetAssessment);
  const clearReport = useResultStore(s => s.clearReport);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [question, setQuestion] = useState<NextQuestionResponse | null>(null);
  const [reveal, setReveal] = useState<RevealResponse | null>(null);
  const [step, setStep] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  // RJP simulation entry point — set only by an explicit "try it on" click
  // on a reveal leaf (handleLikeLeaf), never automatically.
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
      const data = await assessmentApi.akinatorAnswer(assessmentId, {
        question_id: question.question_id,
        selected_option_index: optionIndex,
      });

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

  // Undoes the last answer and re-serves that exact question so it can be
  // answered differently — only available while a question is showing
  // (step > 0 gates the button itself; the backend also rejects it once a
  // reveal has been reached, see akinator_session_service.go_back).
  const handleBack = async () => {
    if (saving || !assessmentId || step === 0) return;
    setSaving(true);
    setError(null);
    try {
      const data = await assessmentApi.akinatorBack(assessmentId);
      if (data.type === 'next_question') {
        setQuestion(data);
        setSelectedIndex(null);
        setStep(prev => prev - 1);
      }
    } catch {
      setError('Не удалось вернуться к предыдущему вопросу.');
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

  // "Ничего из этого не подходит" — rejects every leaf currently shown at
  // once (not a single card) and keeps testing, same mechanism as
  // handleReject. Only the terminal "inconclusive" reveal ends the session
  // via a comment (see handleFeedback / RevealFeedbackFooter variant="final").
  const handleRejectAll = async (slugs: string[]) => {
    if (saving || !assessmentId || slugs.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const data = await assessmentApi.akinatorRejectAll(assessmentId, { leaf_slugs: slugs });
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
      setError('Не удалось продолжить тест.');
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

  // Offered only on the "inconclusive" dead end (no confident pick, no leaf
  // the user chose) — same restart mechanism as the profile page's "Начать
  // тестирование заново" (see useProfile.handleRestartConfirm): a fresh
  // assessment/session is minted server-side by POST /assessment/start, so
  // just clear local state and send the user back to goal selection.
  const handleRetakeTest = () => {
    resetAssessment();
    clearReport();
    navigate('/assessment/goal', { state: { fromRestart: true } });
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
    simulatingLeaf,
    selectedIndex,
    transitioning,
    exitConfirmOpen,
    questionProgress,
    ageGroup,
    handleOptionSelect,
    handleBack,
    handleReject,
    handleRejectAll,
    handleFeedback,
    handleRetakeTest,
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
