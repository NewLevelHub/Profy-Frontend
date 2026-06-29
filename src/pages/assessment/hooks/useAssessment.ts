import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { assessmentApi } from '@/shared/api/assessment';
import { BLOCK_NAMES } from '@/shared/config/constants';
import type { AnswerPayload, AssessmentBlock, Question } from '@/shared/types';
import { getAssessmentBlocks } from '../utils/assessmentBlocks';

export type AssessmentPhase = 'loading' | 'intro' | 'question';

export function useAssessment() {
  const navigate = useNavigate();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const currentBlock = useAssessmentStore(s => s.currentBlock);
  const completedBlocks = useAssessmentStore(s => s.completedBlocks);
  const advanceBlock = useAssessmentStore(s => s.advanceBlock);
  const markBlockCompleted = useAssessmentStore(s => s.markBlockCompleted);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;
  const currentBlockKey = activeBlocks[currentBlock] as AssessmentBlock | undefined;

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [blockAnswers, setBlockAnswers] = useState<AnswerPayload[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }
    if (currentBlock >= totalBlocks) {
      navigate('/assessment/loading', { replace: true });
      return;
    }
    if (!currentBlockKey) return;

    let cancelled = false;

    async function loadBlock() {
      setPhase('loading');
      setError(null);
      try {
        const data = await assessmentApi.getQuestions(assessmentId!, currentBlockKey!);
        if (cancelled) return;
        setQuestions(data);
        setQuestionIndex(0);
        setSelectedIndex(null);
        setBlockAnswers([]);
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

    loadBlock();

    return () => {
      cancelled = true;
      if (introTimerRef.current !== null) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBlock, retryCount]);

  function handleBack() {
    if (questionIndex === 0 || transitioning) return;
    setBlockAnswers(prev => prev.slice(0, questionIndex - 1));
    setQuestionIndex(i => i - 1);
    setSelectedIndex(null);
  }

  function handleOptionSelect(questionId: string, optionIndex: number) {
    if (transitioning) return;
    const isLast = questionIndex === questions.length - 1;

    if (!isLast && selectedIndex !== null) return;

    setSelectedIndex(optionIndex);

    if (isLast) {
      setBlockAnswers(prev => {
        const idx = prev.findIndex(a => a.question_id === questionId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { question_id: questionId, selected_option_index: optionIndex };
          return copy;
        }
        return [...prev, { question_id: questionId, selected_option_index: optionIndex }];
      });
      return;
    }

    setBlockAnswers(prev => [
      ...prev,
      { question_id: questionId, selected_option_index: optionIndex },
    ]);

    setTransitioning(true);
    setTimeout(() => {
      setQuestionIndex(i => i + 1);
      setSelectedIndex(null);
      setTransitioning(false);
    }, 300);
  }

  async function handleNextBlock() {
    if (saving || selectedIndex === null || !currentBlockKey || !assessmentId) return;
    setSaving(true);
    setError(null);
    try {
      await assessmentApi.saveAnswers(assessmentId, {
        block: currentBlockKey,
        answers: blockAnswers,
      });
      markBlockCompleted(currentBlockKey);
      const nextIndex = currentBlock + 1;
      const isLast = nextIndex >= totalBlocks;
      advanceBlock();
      navigate('/assessment/praise', {
        state: {
          title: isLast ? 'Ты справился!' : 'Молодец!',
          subtitle: isLast
            ? 'Считаем результат...'
            : `Блок «${BLOCK_NAMES[currentBlockKey]}» пройден`,
          nextPath: isLast ? '/assessment/loading' : '/assessment',
          completedCount: nextIndex,
          totalBlocks,
        },
      });
    } catch {
      setError('Не удалось сохранить ответы. Попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  function handleExit() {
    if (window.confirm('Выйти из теста? Прогресс сохранён, продолжишь позже')) {
      navigate('/home');
    }
  }

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questions.length > 0 && questionIndex === questions.length - 1;
  const showNextButton = isLastQuestion && selectedIndex !== null;
  const questionProgress =
    questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const overallProgress = totalBlocks > 0 ? (currentBlock / totalBlocks) * 100 : 0;

  return {
    phase,
    questions,
    questionIndex,
    selectedIndex,
    transitioning,
    saving,
    error,
    currentBlock,
    currentBlockKey,
    totalBlocks,
    activeBlocks,
    ageGroup,
    completedBlocks,
    currentQuestion,
    isLastQuestion,
    showNextButton,
    questionProgress,
    overallProgress,
    handleBack,
    handleOptionSelect,
    handleNextBlock,
    handleExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
