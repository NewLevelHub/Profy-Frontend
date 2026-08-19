import { useProfileStore } from '@/shared/store/profile';
import type { AgeGroup, AssessmentGoal, ResultResponse } from '@/shared/types';
import { GoalBadge } from './GoalBadge';
import { ScenarioA } from './scenarios/ScenarioA';
import { ScenarioProfessional } from './scenarios/ScenarioProfessional';

interface GoalBranchSectionProps {
  report: ResultResponse;
  ageGroup: AgeGroup | undefined;
  /** The goal actually chosen at GoalSelectionPage, before the assessment
   *  started — the sole source of which scenario renders here. Not a
   *  switcher seed: there is no runtime way to change it from this page. */
  initialGoal: AssessmentGoal | null;
}

/**
 * The "update boundary" — everything above this (SummaryCard through
 * FinalAnalysisSection in ResultsPage) is the shared diagnostic block and
 * must never re-render based on goal. This component derives its content
 * purely from `initialGoal`/`ageGroup` (both already-fetched, no local
 * state, no re-render trigger) — because nothing above ever received
 * props derived from a goal choice, React's reconciliation naturally
 * leaves them untouched. Everything rendered here comes from the
 * already-fetched `report` (plus the already-loaded profile store); no
 * network requests happen on this page after initial load.
 */
export function GoalBranchSection({ report, ageGroup, initialGoal }: GoalBranchSectionProps) {
  const profile = useProfileStore((s) => s.profile);

  const isJunior = ageGroup === 'junior';
  const goal: AssessmentGoal = initialGoal ?? 'explore';

  // 'profession' and 'university' used to be two separate goals with two
  // separate scenario trees — they're merged now (GoalSelectionPage's
  // "Выбрать профессию" card sends 'university'), so anything that isn't
  // explore/junior falls straight into the one merged scenario. Old
  // assessments can still have `goal: 'profession'` stored (immutable
  // historical data) and must keep landing here too — see
  // ScenarioProfessional for the age-based (not goal-based) tiering that
  // replaces the old goal-based split.
  const content = (isJunior || goal === 'explore')
    ? <ScenarioA interestMap={report.interest_map} />
    : (
      <ScenarioProfessional
        careers={report.careers}
        ageGroup={ageGroup ?? 'middle'}
        grade={profile?.grade}
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-t border-default pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted">
            ДАЛЬШЕ · ПО ТВОЕЙ ЦЕЛИ
          </p>
          <GoalBadge isJunior={isJunior} goal={goal} />
        </div>

        {content}
      </div>
    </div>
  );
}
