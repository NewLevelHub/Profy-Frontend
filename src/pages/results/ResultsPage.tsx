import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useResults } from './hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { AssessmentNotStartedCard } from './components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from './components/AssessmentInProgressCard';
import { ResultsCoverBand } from './components/ResultsCoverBand';
import { ResultsReveal } from './components/ResultsReveal';
import { SummaryCard } from './components/SummaryCard';
import { InterestDomainSection } from './components/InterestDomainSection';
import { StrengthsDomainSection } from './components/StrengthsDomainSection';
import { PersonalityDomainSection } from './components/PersonalityDomainSection';
import { ThinkingStyleMotivationSection } from './components/ThinkingStyleMotivationSection';
import { ExplorationActivitiesSection } from './components/ExplorationActivitiesSection';
import { FinalAnalysisSection } from './components/FinalAnalysisSection';
import { GoalBranchSection } from './components/GoalBranchSection';
import { FeedbackSection } from './components/FeedbackSection';

function ResultsSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </PageContainer>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('results');

  const {
    report,
    isLoading,
    isTranslating,
    error,
    hasCompletedAssessment,
    assessmentId,
    goal,
    ageGroup,
    isJunior,
    refetch,
    inProgress,
    answeredCount,
    totalQuestions,
  } = useResults();

  if (!hasCompletedAssessment) {
    return (
      <PageContainer>
        {inProgress ? (
          <AssessmentInProgressCard
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            onContinue={() => navigate('/assessment')}
          />
        ) : (
          <AssessmentNotStartedCard onStart={() => navigate('/assessment/goal')} />
        )}
      </PageContainer>
    );
  }

  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (isTranslating) {
    return (
      <PageContainer>
        <ResultLoadingView className="min-h-[70vh]" />
      </PageContainer>
    );
  }

  if (error || !report) {
    return (
      <PageContainer>
        <JourneyEmptyState
          mascotState="pause"
          title={t('error.somethingWrong')}
          body={error ?? t('error.loadResults')}
          actionLabel={t('common:retry')}
          onAction={() => refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <ResultsCoverBand
        report={report}
        isJunior={isJunior}
        onDownloadPdf={() => navigate('/results/print?auto=1')}
        onExploreDirections={() => {
          const el = document.getElementById('results-goal-branch');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <ResultsReveal>
        <SummaryCard summary={report.summary} disclaimer={report.disclaimer} />
      </ResultsReveal>

      <ResultsReveal delay={1}>
        <InterestDomainSection
          isJunior={isJunior}
          interestMap={report.interest_map}
          interestMapNote={report.interest_map_note}
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
        <ExplorationActivitiesSection activities={report.exploration_activities} note={report.exploration_note} />
      </ResultsReveal>

      <ResultsReveal>
        <FinalAnalysisSection text={report.final_analysis} />
      </ResultsReveal>

      <div id="results-goal-branch">
        <ResultsReveal>
          <GoalBranchSection report={report} ageGroup={ageGroup} initialGoal={goal} />
        </ResultsReveal>
      </div>

      <ResultsReveal>
        <FeedbackSection assessmentId={assessmentId} />
      </ResultsReveal>
    </PageContainer>
  );
}
