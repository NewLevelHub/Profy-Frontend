import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { directionsApi } from '@/shared/api/directions';
import { assessmentApi } from '@/shared/api/assessment';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { KnownProfessionVerdict } from '@/shared/types';

const VERDICT_PRAISE: Record<KnownProfessionVerdict, { title: string; subtitle: string }> = {
  strong: { title: 'Отлично!', subtitle: 'Похоже, это действительно твоё' },
  partial: { title: 'Готово!', subtitle: 'Есть над чем подумать — смотри результат' },
  weak: { title: 'Готово!', subtitle: 'Результат может удивить — посмотри детали' },
};

/** Drives the "Уже знаю, кем хочу стать" validation quiz: fetches the
 * server-side question bank for one leaf, collects answers locally, and on
 * the last question finalizes through the real backend pipeline (creates a
 * sessionless completed Assessment — see known_profession_service) so every
 * outcome lands on /results instead of a dead end. Mirrors the routing
 * useAkinatorAssessment.handleFeedback uses after a confirmed direction. */
export function useKnownProfessionQuiz(professionSlug: string) {
  const navigate = useNavigate();
  const setAssessment = useAssessmentStore(s => s.setAssessment);
  const completeAssessment = useAssessmentStore(s => s.completeAssessment);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['known-profession-quiz', professionSlug],
    queryFn: () => directionsApi.knownProfessionQuiz(professionSlug),
    enabled: !!professionSlug,
  });

  const finalizeMutation = useMutation({
    mutationFn: (finalAnswers: Record<string, number>) =>
      assessmentApi.knownProfessionFinalize({
        direction_slug: professionSlug,
        answers: finalAnswers,
      }),
    onSuccess: response => {
      setAssessment(response.assessment_id, 'known', false);
      completeAssessment();
      const praise = VERDICT_PRAISE[response.verdict];
      navigate('/assessment/praise', {
        state: {
          ...praise,
          nextPath: `/results/directions/${encodeURIComponent(professionSlug)}/subject-readiness`,
        },
      });
    },
  });

  const questions = data?.questions ?? [];
  const current = questions[questionIndex];
  const isLastQuestion = questionIndex + 1 >= questions.length;
  const progress =
    questions.length === 0
      ? 0
      : ((questionIndex + (selectedIndex != null ? 0.5 : 0)) / questions.length) * 100;

  function handleNext() {
    if (selectedIndex == null || !current) return;

    const nextAnswers = { ...answers, [current.id]: selectedIndex };
    setAnswers(nextAnswers);

    if (isLastQuestion) {
      finalizeMutation.mutate(nextAnswers);
      return;
    }

    setQuestionIndex(i => i + 1);
    setSelectedIndex(null);
  }

  return {
    isLoading,
    error,
    questions,
    questionIndex,
    current,
    isLastQuestion,
    progress,
    selectedIndex,
    setSelectedIndex,
    handleNext,
    submitting: finalizeMutation.isPending,
    finalizeError: finalizeMutation.isError,
  };
}
