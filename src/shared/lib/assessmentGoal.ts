import type { AssessmentGoal, AgeGroup } from '@/shared/types';

/**
 * 'profession' and 'university' were merged into a single goal-selection
 * card (GoalSelectionPage only offers 'profession' now) — but old,
 * already-completed assessments can still have 'university' stored
 * (immutable historical data), so every check here must keep treating both
 * values as equivalent. University/program access itself stays senior-only:
 * the merge removed the *goal* restriction, not the *age* one — at 8–9
 * класс the subject profile isn't locked in yet for admission-specific
 * content to be meaningful.
 */
export function canSeeUniversities(
  goal: AssessmentGoal | null | undefined,
  ageGroup: AgeGroup | null | undefined,
): boolean {
  return (goal === 'profession' || goal === 'university') && ageGroup === 'senior';
}
