import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { assessmentApi } from '@/shared/api/assessment';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useProfileStore } from '@/shared/store/profile';
import { ASSESSMENT_GOAL_ALLOWED_AGE_GROUPS } from '@/shared/config/constants';
import type { AssessmentGoal } from '@/shared/types';

const MAX_GOAL_CHANGES = 3;

export function useChangeGoal() {
  const [pickerOpen, setPickerOpen] = useState(false);

  const assessmentId = useAssessmentStore(s => s.assessmentId);
  const goal = useAssessmentStore(s => s.goal);
  const goalChangedCount = useAssessmentStore(s => s.goalChangedCount);
  const hasCompletedAssessment = useAssessmentStore(s => s.hasCompletedAssessment);
  const setGoal = useAssessmentStore(s => s.setGoal);
  const ageGroup = useProfileStore(s => s.profile?.age_group ?? 'middle');

  const limitReached = hasCompletedAssessment && goalChangedCount >= MAX_GOAL_CHANGES;

  const availableGoals = (Object.keys(ASSESSMENT_GOAL_ALLOWED_AGE_GROUPS) as AssessmentGoal[])
    .filter(g => ASSESSMENT_GOAL_ALLOWED_AGE_GROUPS[g].includes(ageGroup) && g !== goal);

  const mutation = useMutation({
    mutationFn: (newGoal: AssessmentGoal) => assessmentApi.updateGoal(assessmentId!, newGoal),
    onSuccess: (assessment) => {
      setGoal(assessment.goal, assessment.goal_changed_count);
      setPickerOpen(false);
    },
  });

  const errorMessage = mutation.isError
    ? (mutation.error as AxiosError<{ detail?: string }>).response?.data?.detail
      ?? 'Не удалось изменить цель. Попробуй ещё раз.'
    : null;

  function handleOpenPicker() {
    mutation.reset();
    setPickerOpen(true);
  }

  function handleClosePicker() {
    mutation.reset();
    setPickerOpen(false);
  }

  function handleSelectGoal(newGoal: AssessmentGoal) {
    mutation.mutate(newGoal);
  }

  return {
    canChangeGoal: !!assessmentId && availableGoals.length > 0,
    currentGoal: goal,
    availableGoals,
    pickerOpen,
    isPending: mutation.isPending,
    limitReached,
    goalChangedCount,
    errorMessage,
    handleOpenPicker,
    handleClosePicker,
    handleSelectGoal,
  };
}
