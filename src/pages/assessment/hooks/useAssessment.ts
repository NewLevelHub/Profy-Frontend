import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { assessmentApi } from '@/shared/api/assessment';
import type { Question } from '@/shared/types';

export type AssessmentPhase = 'loading' | 'intro' | 'question';

export function useAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const answeredCountFromStore = useAssessmentStore(s => s.answeredCount);
  const setProgress = useAssessmentStore(s => s.setProgress);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
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

    async function loadQuestions() {
      setPhase('loading');
      setError(null);
      try {
        const data = await assessmentApi.getQuestions(assessmentId!);
        if (cancelled) return;
        if (data.length === 0) throw new Error('empty_questions');
        setQuestions(data);

        if (!startIndexApplied.current) {
          startIndexApplied.current = true;
          const startIndex = Math.min(answeredCountFromStore, data.length - 1);
          setQuestionIndex(startIndex);
          if (startIndex >= data.length - 1 && answeredCountFromStore >= data.length) {
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

    loadQuestions();

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
    const question = questions[questionIndex];
    setSelectedValue(question ? (answers[question.id] ?? null) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, questions]);

  function handleStartIntro() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setPhase('question');
  }

  function handleBack() {
    if (questionIndex === 0 || transitioning || saving) return;
    setQuestionIndex(i => i - 1);
  }

  async function handleAnswer(value: number) {
    const question = questions[questionIndex];
    if (!question || saving || transitioning) return;

    setSelectedValue(value);
    setSaving(true);
    setError(null);

    try {
      const response = await assessmentApi.saveAnswers(assessmentId!, {
        answers: [{ question_id: question.id, value }],
      });
      setAnswers(prev => ({ ...prev, [question.id]: value }));
      setProgress(response.answered_count, response.total);

      if (response.completed) {
        completeAssessment();
        navigate('/assessment/loading');
        return;
      }

      const isLast = questionIndex >= questions.length - 1;
      if (isLast) {
        // Shouldn't normally happen (completed should be true), but guard anyway.
        navigate('/assessment/loading');
        return;
      }

      setTransitioning(true);
      setTimeout(() => {
        setQuestionIndex(i => i + 1);
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

  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0;

  return {
    phase,
    questions,
    questionIndex,
    totalQuestions,
    selectedValue,
    transitioning,
    saving,
    error,
    currentQuestion,
    progress,
    exitConfirmOpen,
    handleBack,
    handleStartIntro,
    handleAnswer,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
