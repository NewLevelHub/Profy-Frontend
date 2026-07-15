import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { assessmentApi } from '@/shared/api/assessment';
import type {
  NextQuestionResponse,
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

  const handleFeedback = async (liked: boolean, note: string | null = null) => {
    if (saving || !assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      await assessmentApi.akinatorFeedback(assessmentId, { liked, note });
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

  // Converging indicator: starts fast and slowly approaches 100%, never reaching it.
  const questionProgress = 100 * (1 - Math.pow(0.85, step));

  return {
    isLoading,
    saving,
    error,
    question,
    reveal,
    step,
    isResolving,
    selectedIndex,
    transitioning,
    exitConfirmOpen,
    questionProgress,
    ageGroup,
    handleOptionSelect,
    handleResolve,
    handleReject,
    handleFeedback,
    handleExit: () => setExitConfirmOpen(true),
    confirmExit: () => {
      setExitConfirmOpen(false);
      navigate('/home');
    },
    cancelExit: () => setExitConfirmOpen(false),
    retry: () => setRetryCount(c => c + 1),
  };
}
