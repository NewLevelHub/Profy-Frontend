import type { AgeGroup, AssessmentBlock, AssessmentGoal } from '@/shared/types';

/**
 * Block sequence per methodology — junior skips academic and directions.
 * `wellbeing` is a soft, non-scoring block shown to every age group at the
 * end of the flow; it's excluded from the backend's required-block count,
 * so it never blocks assessment completion.
 */
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

  blocks.push('wellbeing');

  return blocks;
}
