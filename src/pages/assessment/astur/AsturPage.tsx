import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageContainer } from '@/shared/ui/PageContainer';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/typography/Text';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useAsturAssessment } from './hooks/useAsturAssessment';
import { SubtestIntro } from './components/SubtestIntro';
import { SubtestRunner } from './components/SubtestRunner';
import { LabilityRunner } from './components/LabilityRunner';
import { AsturDone } from './components/AsturDone';

export default function AsturPage() {
  const navigate = useNavigate();
  const params = useParams<{ assessmentId: string }>();
  const storeAssessmentId = useAssessmentStore((s) => s.assessmentId);
  const asturCompleted = useAssessmentStore((s) => s.asturCompleted);
  const effectiveAssessmentId = params.assessmentId || storeAssessmentId || '';

  useEffect(() => {
    if (asturCompleted && effectiveAssessmentId) {
      navigate('/assessment/loading', { replace: true });
    }
  }, [asturCompleted, effectiveAssessmentId, navigate]);

  const {
    isLoading,
    loadError,
    subtest,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    submitting,
    submitError,
  } = useAsturAssessment(effectiveAssessmentId);

  const handleDoneContinue = () => {
    navigate('/assessment/loading');
  };

  return (
    <div className="min-h-screen bg-page">
      <PageContainer size="content" className="py-10 flex flex-col gap-6">
        {import.meta.env.DEV && !allDone && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAutofill}
              disabled={submitting}
              className="text-xs text-muted hover:text-primary"
            >
              ⚡ Автозаполнение (АСТУР)
            </Button>
          </div>
        )}

        {!allDone && subtestCount > 0 && (
          <ProgressBar
            value={(subtestIndex / subtestCount) * 100}
            label={`Субтест ${Math.min(subtestIndex + 1, subtestCount)} из ${subtestCount}`}
          />
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {loadError && (
          <Text variant="body-md" className="text-danger text-center py-16">
            {loadError}
          </Text>
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'instruction' && (
          <SubtestIntro subtest={subtest} index={subtestIndex} count={subtestCount} onStart={beginSubtest} />
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'running' && subtest.key === 'lability' && (
          <LabilityRunner
            subtest={subtest}
            itemLimitMs={labilityItemLimitMs}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers, elapsed_ms) => completeSubtest({ answers, elapsed_ms })}
          />
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'running' && subtest.key !== 'lability' && (
          <SubtestRunner
            subtest={subtest}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers) => completeSubtest({ answers })}
          />
        )}

        {!isLoading && !loadError && allDone && <AsturDone onContinue={handleDoneContinue} />}
      </PageContainer>
    </div>
  );
}
