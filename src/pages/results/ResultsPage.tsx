import { useNavigate } from 'react-router';
import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useResults } from './hooks/useResults';
import { AssessmentNotStartedCard } from './components/AssessmentNotStartedCard';
import { AssessmentInProgressCard } from './components/AssessmentInProgressCard';
import { FeedbackSection } from './components/FeedbackSection';
import { ResultsReportBody } from './components/ResultsReportBody';

function AnimatedBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeSlideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' }}>
      {children}
    </div>
  );
}

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

  const {
    report,
    isLoading,
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

  if (isLoading) return <ResultsSkeleton />;

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-4 text-center">
        <span className="text-5xl select-none" aria-hidden="true">⚠️</span>
        <h2 className="text-h1 font-extrabold text-primary">Что-то пошло не так</h2>
        <p className="text-body text-secondary">{error ?? 'Не удалось загрузить результаты.'}</p>
        <Button onClick={() => refetch()}>Повторить</Button>
      </div>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">

      {/* Same-tab navigate, deliberately not a new tab (tried that — Safari
          treats `window.print()` from a script-opened tab as its own
          ephemeral "print preview" surface, and the underlying content tab
          can end up blank once the dialog closes, occasionally clipping the
          save itself). Standard single-tab print flow instead: the dialog
          layers over this same tab, and "К результатам" on the printable
          view navigates back here when done. `?auto=1` opens the print
          dialog itself as soon as the printable view has its fonts, so this
          stays one click. */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Что мы узнали о тебе"
          subtitle={isJunior ? 'Что тебе интересно и что стоит попробовать' : 'Твой профиль интересов и рекомендованное направление'}
        />
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={() => navigate('/results/print?auto=1')}
        >
          <Download size={16} aria-hidden="true" />
          Скачать PDF
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
        isJunior={isJunior}
      />

      <AnimatedBlock>
        <FeedbackSection assessmentId={assessmentId} />
      </AnimatedBlock>

    </PageContainer>
  );
}
