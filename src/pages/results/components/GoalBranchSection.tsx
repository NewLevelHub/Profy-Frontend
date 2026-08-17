import { useState } from 'react';
import { useProfileStore } from '@/shared/store/profile';
import type { AgeGroup, AssessmentGoal, ResultResponse } from '@/shared/types';
import { GoalSwitcher, JuniorGoalLabel } from './GoalSwitcher';
import { ScenarioA } from './scenarios/ScenarioA';
import { ScenarioB } from './scenarios/ScenarioB';
import { ScenarioC } from './scenarios/ScenarioC';
import { ScenarioCDowngrade } from './scenarios/ScenarioCDowngrade';

interface GoalBranchSectionProps {
  report: ResultResponse;
  ageGroup: AgeGroup | undefined;
  /** The assessment's actual stated goal — used only to seed the switcher's initial selection. */
  initialGoal: AssessmentGoal | null;
}

function defaultGoalFor(ageGroup: AgeGroup | undefined, initialGoal: AssessmentGoal | null): AssessmentGoal {
  if (initialGoal) return initialGoal;
  return 'explore';
}

/**
 * The "update boundary" — everything above this (SummaryCard through
 * FinalAnalysisSection in ResultsPage) is the shared diagnostic block and
 * must never re-render when the goal switches. This component owns the
 * switcher's local state entirely by itself: because that state never gets
 * lifted into ResultsPage, and the diagnostic-block components above never
 * receive props derived from it, React's reconciliation naturally leaves
 * them untouched when `selectedGoal` changes — no memoization or manual
 * fetch-splitting needed. Everything rendered here also comes from the
 * already-fetched `report` (plus the already-loaded profile store); goal
 * switching triggers zero network requests.
 */
export function GoalBranchSection({ report, ageGroup, initialGoal }: GoalBranchSectionProps) {
  const [selectedGoal, setSelectedGoal] = useState<AssessmentGoal>(() => defaultGoalFor(ageGroup, initialGoal));
  const profile = useProfileStore((s) => s.profile);

  const isJunior = ageGroup === 'junior';
  const isMiddle = ageGroup === 'middle';

  let content: React.ReactNode;
  if (isJunior) {
    content = <ScenarioA interestMap={report.interest_map} />;
  } else if (selectedGoal === 'explore') {
    content = <ScenarioA interestMap={report.interest_map} />;
  } else if (selectedGoal === 'profession') {
    content = <ScenarioB careers={report.careers} />;
  } else if (isMiddle) {
    // Middle tier picking "university": full ScenarioB content plus the
    // downgrade card below it, per spec — not a replacement.
    content = (
      <div className="flex flex-col gap-6">
        <ScenarioB careers={report.careers} />
        <ScenarioCDowngrade />
      </div>
    );
  } else {
    content = (
      <ScenarioC
        careers={report.careers}
        grade={profile?.grade}
        subjectsEasy={profile?.subjects_easy ?? []}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-t border-default pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[.06em] text-muted">
            ДАЛЬШЕ · ПО ТВОЕЙ ЦЕЛИ
          </p>
          {isJunior ? (
            <JuniorGoalLabel />
          ) : (
            <GoalSwitcher value={selectedGoal} onChange={setSelectedGoal} />
          )}
        </div>

        <div key={isJunior ? 'junior' : selectedGoal} style={{ animation: 'resultsFadeIn 180ms ease both' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
