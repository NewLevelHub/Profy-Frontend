import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui';
import { useHome } from './hooks/useHome';
import { HomeFrame } from './sections/HomeFrame';
import { CompletedOverview } from './sections/CompletedOverview';
import { InProgressOverview } from './sections/InProgressOverview';
import { NotStartedOverview } from './sections/NotStartedOverview';

// "/home" — spec §04: ONE unified home page for every age, no age-branching
// layout ("Раньше здесь стояли два экрана ... Теперь экран один."). Which
// of the three real assessment states (not started / in progress /
// completed) renders is still real branching — that's app state, not an
// age split — but every state shares the same HomeFrame shell, and the
// completed state's copy branches only on `report.interest_instrument`
// (junior/mi vs senior/riasec), never on layout.
export default function HomePage() {
  const {
    isCompleted,
    inProgress,
    answeredCount,
    totalQuestions,
    handleContinue,
    report,
    isReportLoading,
    isJunior,
  } = useHome();

  return (
    <PageContainer>
      <HomeFrame>
        {isCompleted ? (
          isReportLoading || !report ? (
            <div className="flex items-center justify-center min-h-[220px]">
              <Spinner size="lg" />
            </div>
          ) : (
            <CompletedOverview report={report} isJunior={isJunior} onRetake={handleContinue} />
          )
        ) : inProgress ? (
          <InProgressOverview
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            onContinue={handleContinue}
          />
        ) : (
          <NotStartedOverview onStart={handleContinue} />
        )}
      </HomeFrame>
    </PageContainer>
  );
}
