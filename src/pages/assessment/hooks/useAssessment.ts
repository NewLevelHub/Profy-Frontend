import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { assessmentApi } from '@/shared/api/assessment';
import { BLOCK_NAMES, BLOCK_EMOJIS } from '@/shared/config/constants';
import type { AnswerPayload, AssessmentBlock, Question } from '@/shared/types';
import { getAssessmentBlocks } from '../utils/assessmentBlocks';

export type AssessmentPhase = 'loading' | 'intro' | 'question';

export function useAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  // Block progress used to live in the global assessment store, but the akinator
  // engine has no blocks — the store no longer tracks it. This view is unreachable
  // today (every assessment is akinator, see AssessmentPage), so this is session-local
  // scaffolding kept only to keep it compiling until it's removed outright.
  const [currentBlock, setCurrentBlock] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<string[]>([]);
  const advanceBlock = () => setCurrentBlock(b => b + 1);
  const markBlockCompleted = (block: string) =>
    setCompletedBlocks(prev => (prev.includes(block) ? prev : [...prev, block]));

  // Retake mode: /assessment?retake=<blockIndex>
  const retakeParam = searchParams.get('retake');
  const retakeIndex = retakeParam !== null ? parseInt(retakeParam, 10) : null;
  const isRetakeMode = retakeIndex !== null && !isNaN(retakeIndex) && retakeIndex >= 0;

  const activeBlocks = getAssessmentBlocks(ageGroup, goal);
  const totalBlocks = activeBlocks.length;

  // In retake mode use the retake block, otherwise use the store's currentBlock
  const effectiveBlock = isRetakeMode ? retakeIndex! : currentBlock;
  const currentBlockKey = activeBlocks[effectiveBlock] as AssessmentBlock | undefined;

  const [phase, setPhase] = useState<AssessmentPhase>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [blockAnswers, setBlockAnswers] = useState<AnswerPayload[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/assessment/goal', { replace: true });
      return;
    }

    // Normal mode: redirect to loading if all blocks done
    if (!isRetakeMode && currentBlock >= totalBlocks) {
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
        if (data.length === 0) throw new Error('empty_questions');
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
    // effectiveBlock captures both currentBlock (normal) and retakeIndex (retake)
    // assessmentId ensures fresh fetch when a new assessment is started at the same block index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBlock, retryCount, assessmentId]);

  function handleStartBlock() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    setPhase('question');
  }

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

      if (isRetakeMode) {
        // Retake: only one block — go straight to result regeneration
        navigate('/assessment/praise', {
          state: {
            title: 'Готово!',
            subtitle: `Блок «${BLOCK_NAMES[currentBlockKey]}» обновлён`,
            nextPath: '/assessment/loading?retake=1',
            completedCount: totalBlocks,
            totalBlocks,
          },
        });
        return;
      }

      const nextIndex = currentBlock + 1;
      const isLast = nextIndex >= totalBlocks;
      const nextBlockKey = activeBlocks[nextIndex];
      const nextBlockName = nextBlockKey ? BLOCK_NAMES[nextBlockKey] : undefined;
      const nextBlockEmoji = nextBlockKey ? BLOCK_EMOJIS[nextBlockKey] : undefined;
      // IMPORTANT:
      // Do not advance the local block index on the last block before navigating to PraisePage.
      // Otherwise the "currentBlock >= totalBlocks" guard effect can race and immediately redirect
      // to loading/results, skipping the final congratulations screen.
      if (!isLast) {
        advanceBlock();
      }
      navigate('/assessment/praise', {
        state: {
          title: isLast ? 'Ты справился!' : 'Молодец!',
          subtitle: isLast
            ? 'Считаем результат...'
            : `Блок «${BLOCK_NAMES[currentBlockKey]}» пройден`,
          nextPath: isLast ? '/assessment/loading' : '/assessment',
          completedCount: nextIndex,
          totalBlocks,
          nextBlockName,
          nextBlockEmoji,
        },
      });
    } catch {
      setError('Не удалось сохранить ответы. Попробуй ещё раз.');
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
  const isLastQuestion = questions.length > 0 && questionIndex === questions.length - 1;
  const showNextButton = isLastQuestion && selectedIndex !== null;
  const questionProgress =
    questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const overallProgress = totalBlocks > 0 ? (effectiveBlock / totalBlocks) * 100 : 0;

  return {
    phase,
    questions,
    questionIndex,
    selectedIndex,
    transitioning,
    saving,
    error,
    currentBlock: effectiveBlock,
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
    isRetakeMode,
    exitConfirmOpen,
    handleBack,
    handleStartBlock,
    handleOptionSelect,
    handleNextBlock,
    handleExit,
    confirmExit,
    cancelExit,
    retry: () => setRetryCount(c => c + 1),
  };
}
