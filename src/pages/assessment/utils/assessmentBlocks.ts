import type { AgeGroup, AssessmentBlock, AssessmentGoal } from '@/shared/types';

const BASE_BLOCKS: AssessmentBlock[] = [
  'interests',
  'thinking',
  'personality',
  'motivation',
  'academic',
  'directions',
  'goal_clarification',
];

export function getAssessmentBlocks(
  ageGroup: AgeGroup,
  goal: AssessmentGoal | null,
): AssessmentBlock[] {
  if (goal === 'university' && ageGroup === 'senior') {
    return [...BASE_BLOCKS, 'university'];
  }
  return BASE_BLOCKS;
}
