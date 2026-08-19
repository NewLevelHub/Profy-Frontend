import { ASSESSMENT_GOAL_LABELS, AGE_GROUP_LABELS, AGE_GROUPS } from '@/shared/config/constants';
import type { AssessmentGoal } from '@/shared/types';

interface GoalBadgeProps {
  isJunior: boolean;
  goal: AssessmentGoal;
}

/**
 * Static badge for the "ДАЛЬШЕ · ПО ТВОЕЙ ЦЕЛИ" row — never an interactive
 * switcher. The goal was fixed once, at GoalSelectionPage, before the
 * assessment started; letting a student re-pick it here would imply the
 * result content is a live toggle rather than something already decided,
 * which is misleading. Junior shows its age bracket instead of a goal
 * label since junior is always pinned to explore/ScenarioA regardless of
 * the stored goal (see GoalBranchSection) — a goal label would claim a
 * choice that was never actually offered.
 */
export function GoalBadge({ isJunior, goal }: GoalBadgeProps) {
  return (
    <span className="inline-flex items-center font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
      {isJunior ? AGE_GROUP_LABELS[AGE_GROUPS.JUNIOR] : ASSESSMENT_GOAL_LABELS[goal]}
    </span>
  );
}
