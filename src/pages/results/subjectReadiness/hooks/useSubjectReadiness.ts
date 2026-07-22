import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { subjectReadinessApi } from '@/shared/api/subjectReadiness';
import { useAssessmentStore } from '@/shared/store/assessment';
import type { SubjectAnswerPayload, SubjectReadinessResult } from '@/shared/types';

export type SubjectReadinessErrorKind = 'wrong_direction' | 'forbidden' | 'generic';

function errorKind(err: unknown): SubjectReadinessErrorKind {
  const status = (err as AxiosError)?.response?.status;
  if (status === 400) return 'wrong_direction';
  if (status === 403) return 'forbidden';
  return 'generic';
}

const ERROR_MESSAGES: Record<SubjectReadinessErrorKind, string> = {
  wrong_direction: 'Сначала заверши тест и выбери направление.',
  forbidden: 'Эта возможность пока недоступна для твоего возраста.',
  generic: 'Не удалось загрузить квиз. Попробуй ещё раз.',
};

export function useSubjectReadiness() {
  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const resultQueryKey = ['subject-readiness-result', assessmentId] as const;
  const resultQuery = useQuery({
    queryKey: resultQueryKey,
    queryFn: () => subjectReadinessApi.getResult(assessmentId!),
    enabled: !!assessmentId,
    retry: false,
  });

  const resultNotFoundYet = (resultQuery.error as AxiosError | null)?.response?.status === 404;

  // Only ask for questions once we know there's no completed result yet —
  // the backend allows exactly one quiz session per assessment, so calling
  // this while a completed result already exists is a 400.
  const questionsQuery = useQuery({
    queryKey: ['subject-readiness-questions', assessmentId] as const,
    queryFn: () => subjectReadinessApi.getQuestions(assessmentId!),
    enabled: !!assessmentId && resultQuery.isError && resultNotFoundYet,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, err) => {
      const s = (err as AxiosError)?.response?.status;
      if (s === 400 || s === 403 || s === 404) return false;
      return failureCount < 1;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (payload: SubjectAnswerPayload[]) =>
      subjectReadinessApi.submitAnswers(assessmentId!, payload),
    onSuccess: (data: SubjectReadinessResult) => {
      queryClient.setQueryData(resultQueryKey, data);
    },
  });

  const result = resultQuery.data ?? submitMutation.data ?? null;
  const questions = questionsQuery.data ?? [];

  const selectAnswer = useCallback((questionId: string, index: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  }, []);

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  const submit = useCallback(() => {
    if (!allAnswered || submitMutation.isPending) return;
    const payload: SubjectAnswerPayload[] = questions.map(q => ({
      question_id: q.id,
      selected_option_index: answers[q.id],
    }));
    submitMutation.mutate(payload);
  }, [allAnswered, questions, answers, submitMutation]);

  // Gating errors (403/400) surface from whichever call ran into them first.
  const gatingSource = resultQuery.isError && !resultNotFoundYet ? resultQuery.error : questionsQuery.error;
  const kind = gatingSource ? errorKind(gatingSource) : null;

  return {
    isLoading: resultQuery.isLoading || (resultNotFoundYet && questionsQuery.isLoading && !result),
    result,
    hasResult: !!result,
    questions,
    answers,
    selectAnswer,
    allAnswered,
    submit,
    isSubmitting: submitMutation.isPending,
    errorKind: kind,
    errorMessage: kind ? ERROR_MESSAGES[kind] : null,
  };
}
