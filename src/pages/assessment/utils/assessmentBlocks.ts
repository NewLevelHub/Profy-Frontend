import type { AgeGroup, AssessmentBlock, AssessmentGoal } from '@/shared/types';

/** Block sequence per methodology — junior skips academic and directions. */
export function getAssessmentBlocks(
  ageGroup: AgeGroup,
  goal: AssessmentGoal | null,
): AssessmentBlock[] {
  const blocks: AssessmentBlock[] = [
    'interests',
    'thinking',
    'personality',
    'motivation',
  ];

  if (ageGroup !== 'junior') {
    blocks.push('academic', 'directions');
  }

  blocks.push('goal_clarification');

  if (ageGroup === 'senior' && goal === 'university') {
    blocks.push('university');
  }

  return blocks;
}
