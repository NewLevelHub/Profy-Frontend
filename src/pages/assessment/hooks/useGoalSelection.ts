import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentApi } from '@/shared/api/assessment';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import type { AssessmentGoal } from '@/shared/types';
import type { AxiosError } from 'axios';

export function useGoalSelection() {
  const navigate = useNavigate();
  const setAssessment = useAssessmentStore(s => s.setAssessment);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const [resumeOpen, setResumeOpen] = useState(false);

  const { data: current, isLoading: isCheckingCurrent } = useQuery({
    queryKey: ['assessment', 'current'],
    queryFn: () =>
      assessmentApi.current().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isCheckingCurrent && current?.status === 'in_progress') {
      setResumeOpen(true);
    }
  }, [isCheckingCurrent, current]);

  const startMutation = useMutation({
    mutationFn: (goal: AssessmentGoal) => assessmentApi.start(goal),
    onSuccess: (assessment) => {
      setAssessment(assessment.id, assessment.goal, assessment.current_block);
      navigate('/assessment');
    },
  });

  function handleGoalSelect(goal: AssessmentGoal) {
    startMutation.mutate(goal);
  }

  function handleResume() {
    if (current) {
      setAssessment(current.id, current.goal, current.current_block);
      navigate('/assessment');
    }
  }

  function handleStartNew() {
    setResumeOpen(false);
  }

  return {
    ageGroup,
    isLoading: startMutation.isPending,
    isCheckingCurrent,
    error: startMutation.isError ? 'Не удалось начать тест. Попробуй ещё раз.' : null,
    resumeOpen,
    currentGoal: current?.goal ?? null,
    handleGoalSelect,
    handleResume,
    handleStartNew,
  };
}
