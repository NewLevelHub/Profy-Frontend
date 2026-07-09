import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { inquiryApi } from '@/shared/api/inquiry';
import { useAssessmentStore } from '@/shared/store/assessment';

export function useDirectionInquiry(slug: string) {
  const assessmentId = useAssessmentStore(s => s.assessmentId);

  const questionsQuery = useQuery({
    queryKey: ['inquiry', 'questions', assessmentId, slug] as const,
    queryFn: () => inquiryApi.getQuestions(assessmentId!, slug),
    enabled: !!assessmentId,
    staleTime: Infinity,
    retry: (failureCount, err) => {
      const s = (err as AxiosError)?.response?.status;
      if (s === 403 || s === 400) return false;
      return failureCount < 1;
    },
  });

  const questions = questionsQuery.data ?? null;

  // Ephemeral answers (one scale index per question) — not persisted.
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  useEffect(() => {
    if (questions) setAnswers(Array(questions.questions.length).fill(null));
  }, [questions]);

  const setAnswer = useCallback((index: number, value: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const verdictMutation = useMutation({
    mutationFn: (finalAnswers: number[]) =>
      inquiryApi.submitAnswers(assessmentId!, slug, finalAnswers),
  });

  const allAnswered = answers.length > 0 && answers.every(a => a !== null);

  const submit = useCallback(() => {
    if (allAnswered) verdictMutation.mutate(answers as number[]);
  }, [allAnswered, answers, verdictMutation]);

  return {
    questions,
    isLoading: questionsQuery.isLoading,
    error: questionsQuery.isError
      ? 'Не удалось загрузить вопросы. Попробуй ещё раз.'
      : null,
    answers,
    setAnswer,
    allAnswered,
    submit,
    verdict: verdictMutation.data ?? null,
    isSubmitting: verdictMutation.isPending,
    submitError: verdictMutation.isError
      ? 'Не удалось получить вывод. Попробуй ещё раз.'
      : null,
  };
}
