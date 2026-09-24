import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui/Spinner';
import { Text } from '@/shared/ui/typography/Text';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useBelbinAssessment } from './hooks/useBelbinAssessment';
import { BelbinBlock } from './components/BelbinBlock';
import { BelbinDone } from './components/BelbinDone';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';

export default function BelbinPage() {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const params = useParams<{ assessmentId: string }>();
  const storeAssessmentId = useAssessmentStore((s) => s.assessmentId);
  const belbinCompleted = useAssessmentStore((s) => s.belbinCompleted);
  const effectiveAssessmentId = params.assessmentId || storeAssessmentId || '';

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
    progress,
    exitConfirmOpen,
    setAllocationValue,
    start,
    goBack,
    goNext,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    submitting,
    submitError,
  } = useBelbinAssessment(effectiveAssessmentId);

  const headerTitle =
    phase === 'block'
      ? t('rail.sectionOf', { current: sectionIndex + 1, total: sectionCount })
      : t('rail.sectionBelbin');

  // Guards direct navigation back to an already-completed Belbin test (e.g.
  // browser back button); the in-flow completion instead lands on phase
  // 'done' and lets BelbinDone own the transition, so this must not fire then.
  useEffect(() => {
    if (belbinCompleted && phase !== 'done' && effectiveAssessmentId) {
      navigate(`/assessment/astur/${effectiveAssessmentId}`, { replace: true });
    }
  }, [belbinCompleted, phase, effectiveAssessmentId, navigate]);

  const handleDoneContinue = useCallback(() => {
    navigate(`/assessment/astur/${effectiveAssessmentId}`);
  }, [navigate, effectiveAssessmentId]);

  return (
    <div className="min-h-screen bg-page">
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

      {phase !== 'done' && (
        <AssessmentRail
          title={headerTitle}
          sectionLabel={t('rail.sectionBelbin')}
          progressAriaLabel={t('rail.progressAriaBelbin')}
          progress={progress}
          onExit={handleExit}
          devAutofill={{ onClick: handleAutofill, loading: submitting }}
        />
      )}

      <PageContainer size="content" className="py-10">
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
          <AssessmentIntro
            kicker={t('intro.belbin.kicker')}
            title={t('intro.belbin.title')}
            subtitle={instruction || t('intro.belbin.subtitle')}
            itemCountLabel={t('intro.itemCount', { count: sectionCount })}
            durationLabel={t('intro.durationMin', { count: Math.max(5, sectionCount) })}
            ctaLabel={t('intro.belbin.cta')}
            onStart={start}
          />
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
