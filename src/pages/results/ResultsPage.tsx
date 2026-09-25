import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { useResults } from './hooks/useResults';
import { ResultLoadingView } from '@/pages/assessment/components/ResultLoadingView';
import { AssessmentNotStartedCard } from './components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from './components/AssessmentInProgressCard';
import { ResultsReveal } from './components/ResultsReveal';
import { FeedbackSection } from './components/FeedbackSection';
import { ResultsReportBody } from './components/ResultsReportBody';
import { AsturRetakeCard } from './components/AsturRetakeCard';

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
            currentPhase={currentPhase}
            onContinue={() => navigate(continueRoute)}
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

  // Test finished, report generated, but a psychologist hasn't published it
  // yet (PRO-337). useResults keeps polling and swaps the report in once it is.
  if (isPendingReview) {
    return (
      <PageContainer>
        <JourneyEmptyState
          mascotState="pause"
          title={t('pendingReview.title')}
          body={t('pendingReview.body')}
        />
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
      {/* Обложка «Что мы узнали о тебе» снята: её чипсы (интересы, сильная
          сторона, направление) и кнопка «Смотреть направления» слово в слово
          повторяли секции ниже — отчёт начинался с пересказа самого себя.
          Из неё остаётся только выход в PDF: /results/print больше ниоткуда
          не открывается, поэтому кнопка живёт здесь отдельной строкой. */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate('/results/print?auto=1')}>
          <Download size={16} aria-hidden="true" />
          {t('page.downloadPdf')}
        </Button>
      </div>

      {/* Порядок разделов — TZ_Profi.md §18.2. Тело отчёта вынесено в
          ResultsReportBody и переиспользуется на экране психолога
          (PsychologistStudentReportPage). Психоблок «Дополнительно для
          специалиста» там же — на стороне бэкенда он отдаётся только
          психологу/админу (report_service.psych_sections_for), у ученика
          `validity`/`psychoemotional` = null и блок не рендерится. */}
      <ResultsReportBody
        report={report}
        ageGroup={ageGroup}
        goal={goal}
      />

      <AsturRetakeCard assessmentId={assessmentId} />

      <ResultsReveal>
        <FeedbackSection assessmentId={assessmentId} />
      </ResultsReveal>
    </PageContainer>
  );
}
