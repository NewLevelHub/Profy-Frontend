import type { ReactNode } from 'react';
import type { AgeGroup, AssessmentGoal, ResultResponse } from '@/shared/types';
import { SummaryCard } from './SummaryCard';
import { InterestDomainSection } from './InterestDomainSection';
import { StrengthsDomainSection } from './StrengthsDomainSection';
import { PersonalityDomainSection } from './PersonalityDomainSection';
import { ThinkingStyleMotivationSection } from './ThinkingStyleMotivationSection';
import { ExplorationActivitiesSection } from './ExplorationActivitiesSection';
import { FinalAnalysisSection } from './FinalAnalysisSection';
import { GoalBranchSection } from './GoalBranchSection';
import { SpecialistSectionsBlock } from './psych/SpecialistSectionsBlock';

function AnimatedBlock({ children }: { children: ReactNode }) {
  return (
    <div style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
      {children}
    </div>
  );
}

interface ResultsReportBodyProps {
  report: ResultResponse;
  ageGroup: AgeGroup | undefined;
  goal: AssessmentGoal | null | undefined;
  isJunior: boolean;
}

/**
 * The report itself — every diagnostic section, in the TZ_Profi.md §18.2
 * order. Presentational: fed a `report` object, no data fetching. Shared by
 * the student's own ResultsPage and the psychologist's read-only view of a
 * student's report (PsychologistStudentReportPage), so both render an
 * identical body. Page chrome (header, "Скачать PDF", feedback) stays on the
 * pages, not here.
 *
 * The psych-block «Дополнительно для специалиста» block is gated server-side
 * (report_service.psych_sections_for → psychologist/admin only), so on the
 * student's page `hasPsych` is always false and nothing renders.
 */
export function ResultsReportBody({ report, ageGroup, goal, isJunior }: ResultsReportBodyProps) {
  const psychSections = {
    validity: report.validity ?? null,
    psychoemotional: report.psychoemotional ?? null,
    mac: report.mac ?? null,
  };
  const hasPsych =
    !!psychSections.validity || !!psychSections.psychoemotional || !!psychSections.mac;

  return (
    <>
      <AnimatedBlock>
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} />
      </AnimatedBlock>

      <AnimatedBlock>
        <InterestDomainSection
          isJunior={isJunior}
          interestMap={report.interest_map}
          interestMapNote={report.interest_map_note}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <StrengthsDomainSection strengthCards={report.strength_cards} />
      </AnimatedBlock>

      <AnimatedBlock>
        <PersonalityDomainSection
          personalityNotes={report.personality_notes}
          personalityNote={report.personality_note}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <ThinkingStyleMotivationSection
          thinkingStyleNotes={report.thinking_style_notes}
          motivationHighlights={report.motivation_highlights}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <ExplorationActivitiesSection
          activities={report.exploration_activities}
          note={report.exploration_note}
        />
      </AnimatedBlock>

      <AnimatedBlock>
        <FinalAnalysisSection text={report.final_analysis} />
      </AnimatedBlock>

      <AnimatedBlock>
        <GoalBranchSection report={report} ageGroup={ageGroup} initialGoal={goal ?? null} />
      </AnimatedBlock>

      {hasPsych && (
        <AnimatedBlock>
          <SpecialistSectionsBlock {...psychSections} />
        </AnimatedBlock>
      )}
    </>
  );
}
