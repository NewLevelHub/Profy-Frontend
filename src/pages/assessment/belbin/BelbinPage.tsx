import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button';
import { Text } from '@/shared/ui/typography/Text';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useBelbinAssessment } from './hooks/useBelbinAssessment';
import { BelbinIntro } from './components/BelbinIntro';
import { BelbinBlock } from './components/BelbinBlock';
import { BelbinDone } from './components/BelbinDone';

export default function BelbinPage() {
  const navigate = useNavigate();
  const params = useParams<{ assessmentId: string }>();
  const storeAssessmentId = useAssessmentStore((s) => s.assessmentId);
  const belbinCompleted = useAssessmentStore((s) => s.belbinCompleted);
  const effectiveAssessmentId = params.assessmentId || storeAssessmentId || '';

  useEffect(() => {
    if (belbinCompleted && effectiveAssessmentId) {
      navigate(`/assessment/astur/${effectiveAssessmentId}`, { replace: true });
    }
  }, [belbinCompleted, effectiveAssessmentId, navigate]);

  const {
    isLoading,
    loadError,
    instruction,
    phase,
    section,
    sectionIndex,
    sectionCount,
    allocation,
    blockTotal,
    isBlockValid,
    isLastBlock,
    setAllocationValue,
    start,
    goBack,
    goNext,
    handleAutofill,
    submitting,
    submitError,
  } = useBelbinAssessment(effectiveAssessmentId);

  const handleDoneContinue = () => {
    navigate(`/assessment/astur/${effectiveAssessmentId}`);
  };

  return (
    <div className="min-h-screen bg-page">
      <PageContainer size="content" className="py-10">
        {import.meta.env.DEV && phase !== 'done' && (
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAutofill}
              disabled={submitting}
              className="text-xs text-muted hover:text-primary"
            >
              ⚡ Автозаполнение (Belbin)
            </Button>
          </div>
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

        {!isLoading && !loadError && phase === 'intro' && (
          <BelbinIntro instruction={instruction} onStart={start} />
        )}

        {!isLoading && !loadError && phase === 'block' && section && (
          <BelbinBlock
            section={section}
            sectionIndex={sectionIndex}
            sectionCount={sectionCount}
            allocation={allocation}
            blockTotal={blockTotal}
            isValid={isBlockValid}
            isLastBlock={isLastBlock}
            submitting={submitting}
            submitError={submitError}
            onChange={setAllocationValue}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {phase === 'done' && <BelbinDone onContinue={handleDoneContinue} />}
      </PageContainer>
    </div>
  );
}
