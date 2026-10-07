import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useResults } from './hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { AssessmentNotStartedCard } from './components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from './components/AssessmentInProgressCard';
import { AssessmentCompletedCard } from './components/AssessmentCompletedCard';
import { ResultsReveal } from './components/ResultsReveal';
import { FeedbackSection } from './components/FeedbackSection';
import { StudentReport } from './components/StudentReport';

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
    isPendingReview,
    error,
    hasCompletedAssessment,
    assessmentId,
    goal,
    ageGroup,
    refetch,
    inProgress,
    completedPhaseCount,
    totalPhaseCount,
    journeyProgress,
    currentPhase,
    continueRoute,
  } = useResults();

  if (!hasCompletedAssessment) {
    return (
      <PageContainer>
        {inProgress ? (
          <AssessmentInProgressCard
            completedPhaseCount={completedPhaseCount}
            totalPhaseCount={totalPhaseCount}
            progress={journeyProgress}
            currentPhase={currentPhase}
            onContinue={() => navigate(continueRoute)}
          />
        ) : (
          <AssessmentNotStartedCard
            onStart={() => navigate('/assessment/goal', { state: { fromNotStarted: true } })}
          />
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

  // Test finished, report not published yet (PRO-337). No waiting-room screen
  // (PRO-401) — show a done state; useResults still polls so the report swaps
  // in once a psychologist publishes.
  if (isPendingReview) {
    return (
      <PageContainer>
        <AssessmentCompletedCard
          onOpenProfile={() => navigate('/profile')}
          onOpenUniversities={() => navigate('/universities')}
        />
      </PageContainer>
    );
  }

  if (error || !report) {
    return (
      <PageContainer>
        <JourneyEmptyState
          illustration="/mascot/redesign/rest.png"
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
      <StudentReport
        report={report}
        ageGroup={ageGroup}
        goal={goal}
        onDownload={() => navigate('/results/print?auto=1')}
      >
        <ResultsReveal>
          <FeedbackSection assessmentId={assessmentId} />
        </ResultsReveal>
      </StudentReport>
    </PageContainer>
  );
}
