import type { AssessmentGoal, AssessmentStatus } from '@/shared/types';

export const ASSESSMENT_GOAL_LABELS: Record<AssessmentGoal, string> = {
  explore: 'Исследовать',
  profession: 'Выбрать профессию',
  university: 'Поступить в вуз',
  unsure: 'Не уверен',
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  in_progress: 'В процессе',
  completed: 'Завершён',
};
