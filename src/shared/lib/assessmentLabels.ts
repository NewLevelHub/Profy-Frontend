import type { AssessmentGoal, AssessmentStatus } from '@/shared/types';

export const ASSESSMENT_GOAL_LABELS: Record<AssessmentGoal, string> = {
  explore: 'admin:goal.explore',
  profession: 'admin:goal.profession',
  university: 'admin:goal.university',
  unsure: 'admin:goal.unsure',
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  in_progress: 'admin:status.in_progress',
  completed: 'admin:status.completed',
};
