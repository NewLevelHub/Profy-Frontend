import type { AgeGroup, AssessmentGoal, ResultResponse } from '@/shared/types';
import { ResultsReveal } from './ResultsReveal';
import { SummaryCard } from './SummaryCard';
import { InterestDomainSection } from './InterestDomainSection';
import { StrengthsDomainSection } from './StrengthsDomainSection';
import { PersonalityDomainSection } from './PersonalityDomainSection';
import { ThinkingStyleMotivationSection } from './ThinkingStyleMotivationSection';
import { ExplorationActivitiesSection } from './ExplorationActivitiesSection';
import { FinalAnalysisSection } from './FinalAnalysisSection';
import { GoalBranchSection } from './GoalBranchSection';
import { SpecialistSectionsBlock } from './psych/SpecialistSectionsBlock';

interface ResultsReportBodyProps {
  report: ResultResponse;
  ageGroup: AgeGroup | undefined;
  goal: AssessmentGoal | null | undefined;
  /** Psychologist's view (PsychologistStudentReportPage): the "Направления
   *  под цель" list is informational only there, not a doorway into the
   *  student's own direction/university browsing flow — see
   *  GoalBranchSection/ScenarioProfessional/DirectionMatchList. Defaults to
   *  the student's normal, clickable behaviour. */
  readOnly?: boolean;
}

/**
 * The report itself — every diagnostic section, in the TZ_Profi.md §18.2
 * order. Presentational: fed a `report` object, no data fetching. Shared by
 * the student's own ResultsPage and the psychologist's read-only view of a
 * student's report (PsychologistStudentReportPage), so both render an
 * identical body. Page chrome (header, "Скачать PDF", feedback) stays on the
 * pages, not here.
 *
 * The psych-block (psychoemotional) is gated server-side
 * (report_service.psych_sections_for → psychologist/admin only), so on the
 * student's page `hasPsych` is always false and nothing renders.
 */
export function ResultsReportBody({ report, ageGroup, goal, readOnly = false }: ResultsReportBodyProps) {
  const psychSections = {
    psychoemotional: report.psychoemotional ?? null,
  };
  const hasPsych = !!psychSections.psychoemotional;

  return (
    <>
      <ResultsReveal>
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} />
      </ResultsReveal>

      <ResultsReveal delay={1}>
        <InterestDomainSection
          interestMap={report.interest_map}
          interestMapNote={report.interest_map_note}
          interestCombination={report.interest_instrument === 'riasec' ? report.interest_combination : null}
        />
      </ResultsReveal>

      <ResultsReveal delay={1}>
        <StrengthsDomainSection strengthCards={report.strength_cards} />
      </ResultsReveal>

      <ResultsReveal>
        <PersonalityDomainSection
          personalityNotes={report.personality_notes}
          personalityNote={report.personality_note}
        />
      </ResultsReveal>

      <ResultsReveal>
        <ThinkingStyleMotivationSection
          thinkingStyleNotes={report.thinking_style_notes}
          motivationHighlights={report.motivation_highlights}
        />
      </ResultsReveal>

      <ResultsReveal>
        <ExplorationActivitiesSection
          activities={report.exploration_activities}
          note={report.exploration_note}
        />
      </ResultsReveal>

      <ResultsReveal>
        <FinalAnalysisSection text={report.final_analysis} />
      </ResultsReveal>

      <div id="results-goal-branch">
        <ResultsReveal>
          <GoalBranchSection report={report} ageGroup={ageGroup} initialGoal={goal ?? null} readOnly={readOnly} />
        </ResultsReveal>
      </div>

      {hasPsych && (
        <ResultsReveal>
          <SpecialistSectionsBlock {...psychSections} />
        </ResultsReveal>
      )}
    </>
  );
}
