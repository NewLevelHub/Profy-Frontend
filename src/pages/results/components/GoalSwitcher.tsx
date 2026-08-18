import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/config/constants';
import type { AssessmentGoal } from '@/shared/types';

const SWITCHABLE_GOALS: AssessmentGoal[] = ['explore', 'profession', 'university'];

interface GoalSwitcherProps {
  value: AssessmentGoal;
  onChange: (goal: AssessmentGoal) => void;
}

/**
 * Real, interactive goal switcher — middle (12–14) and senior (15–18) only.
 * Junior (6–11) never renders this: see JuniorGoalLabel below for why a
 * disabled/greyed-out version would be wrong here.
 */
export function GoalSwitcher({ value, onChange }: GoalSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Выбор сценария по цели">
      {SWITCHABLE_GOALS.map((goal) => (
        <button
          key={goal}
          type="button"
          onClick={() => onChange(goal)}
          aria-pressed={value === goal}
          className={cn(
            'px-4 py-2 rounded-pill text-sm font-bold border-[1.5px] transition-colors cursor-pointer',
            value === goal
              ? 'bg-brand text-on-brand border-brand'
              : 'bg-surface text-secondary border-default hover:border-brand',
          )}
        >
          {ASSESSMENT_GOAL_LABELS[goal]}
        </button>
      ))}
    </div>
  );
}

/**
 * Junior (6–11) gets a static label instead of a switcher — deliberately
 * not a disabled/greyed-out switcher. Per spec: a disabled control here
 * would silently advertise a "real" B/C result the child was denied, and
 * age isn't a user-controllable dimension the way e.g. a role permission
 * is — there's nothing to invite the child to unlock or ask about.
 */
export function JuniorGoalLabel() {
  return (
    <span className="inline-flex items-center font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
      JUNIOR · 6–11
    </span>
  );
}
