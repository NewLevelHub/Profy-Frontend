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

interface ResultsReportBodyProps {
  report: ResultResponse;
  ageGroup: AgeGroup | undefined;
  goal: AssessmentGoal | null | undefined;
}

/**
 * The report itself — every diagnostic section, in the TZ_Profi.md §18.2
 * order. Presentational: fed a `report` object, no data fetching. Page
 * chrome (header, "Скачать PDF", feedback) stays on the page, not here.
 * Section ids are the anchors of StudentReport's table of contents.
 *
 * The psych-block (psychoemotional) is not rendered here: the API includes
 * it only for psychologist/admin (report_service.psych_sections_for), and
 * the psychologist cabinet has its own report screens.
 */
export function ResultsReportBody({ report, ageGroup, goal }: ResultsReportBodyProps) {
  return (
    <>
      <ResultsReveal id="report-summary">
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} />
      </ResultsReveal>

      <ResultsReveal delay={1} id="report-interests">
        <InterestDomainSection
          interestMap={report.interest_map}
          interestMapNote={report.interest_map_note}
          interestCombination={report.interest_instrument === 'riasec' ? report.interest_combination : null}
        />
      </ResultsReveal>

      <ResultsReveal delay={1} id="report-strengths">
        <StrengthsDomainSection strengthCards={report.strength_cards} />
      </ResultsReveal>

      {report.personality_notes.length > 0 && (
        <ResultsReveal id="report-personality">
          <PersonalityDomainSection
            personalityNotes={report.personality_notes}
            personalityNote={report.personality_note}
          />
        </ResultsReveal>
      )}

      <ResultsReveal id="report-thinking">
        <ThinkingStyleMotivationSection
          thinkingStyleNotes={report.thinking_style_notes}
          motivationHighlights={report.motivation_highlights}
        />
      </ResultsReveal>

      <ResultsReveal id="report-exploration">
        <ExplorationActivitiesSection
          activities={report.exploration_activities}
          note={report.exploration_note}
        />
      </ResultsReveal>

      <ResultsReveal id="report-analysis">
        <FinalAnalysisSection text={report.final_analysis} />
      </ResultsReveal>

      <div id="results-goal-branch" tabIndex={-1}>
        <ResultsReveal>
          <GoalBranchSection report={report} ageGroup={ageGroup} initialGoal={goal ?? null} />
        </ResultsReveal>
      </div>
    </>
  );
}
