import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui/Spinner';
import { Text } from '@/shared/ui/typography/Text';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useAssessmentStore } from '@/shared/store/assessment';
import { useAssessmentJourneyProgress } from '../hooks/useAssessmentJourneyProgress';
import { useAsturAssessment } from './hooks/useAsturAssessment';
import { SubtestIntro } from './components/SubtestIntro';
import { SubtestRunner } from './components/SubtestRunner';
import { LabilityRunner } from './components/LabilityRunner';
import { AsturDone } from './components/AsturDone';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';

function blockIntroKey(assessmentId: string) {
  return `profy-astur-block-intro-seen:${assessmentId}`;
}

export default function AsturPage() {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const params = useParams<{ assessmentId: string }>();
  const storeAssessmentId = useAssessmentStore((s) => s.assessmentId);
  const asturCompleted = useAssessmentStore((s) => s.asturCompleted);
  const effectiveAssessmentId = params.assessmentId || storeAssessmentId || '';

  // One-time "let's begin" moment for the whole АСТУР block, matching the
  // intro every other test block gets — only on a genuinely fresh start.
  const [blockIntroSeen, setBlockIntroSeen] = useState(() => {
    if (typeof sessionStorage === 'undefined' || !effectiveAssessmentId) return false;
    return sessionStorage.getItem(blockIntroKey(effectiveAssessmentId)) === '1';
  });

  function handleStartBlockIntro() {
    if (typeof sessionStorage !== 'undefined' && effectiveAssessmentId) {
      sessionStorage.setItem(blockIntroKey(effectiveAssessmentId), '1');
    }
    setBlockIntroSeen(true);
  }

  const {
    isLoading,
    loadError,
    subtest,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs,
    exitConfirmOpen,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    submitting,
    submitError,
  } = useAsturAssessment(effectiveAssessmentId);

  // Guards direct navigation back to an already-completed АСТУР test (e.g.
  // browser back button); the in-flow completion instead lands on `allDone`
  // and lets AsturDone own the transition, so this must not fire then.
  useEffect(() => {
    if (asturCompleted && !allDone && effectiveAssessmentId) {
      navigate('/assessment/loading', { replace: true });
    }
  }, [asturCompleted, allDone, effectiveAssessmentId, navigate]);

  const handleDoneContinue = useCallback(() => {
    navigate('/assessment/loading');
  }, [navigate]);

  const headerTitle = subtestCount > 0
    ? t('rail.subtestOf', { current: Math.min(subtestIndex + 1, subtestCount), total: subtestCount })
    : t('rail.sectionAstur');

  const progress = useAssessmentJourneyProgress({
    asturFraction:
      allDone || asturCompleted
        ? 1
        : !blockIntroSeen || subtestCount === 0
          ? 0
          : subtestIndex / subtestCount,
  });

  return (
    <div className="min-h-screen bg-page">
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

      {!allDone && (
        <AssessmentRail
          title={headerTitle}
          sectionLabel={t('rail.sectionAstur')}
          progressAriaLabel={t('rail.progressAriaAstur')}
          progress={progress}
          onExit={handleExit}
          devAutofill={{ onClick: handleAutofill, loading: submitting }}
        />
      )}

      <PageContainer size="content" className="py-10 flex flex-col gap-6">
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

        {!isLoading && !loadError && subtest && stepPhase === 'instruction' && subtestIndex === 0 && !blockIntroSeen && (
          <AssessmentIntro
            kicker={t('intro.astur.kicker')}
            title={t('intro.astur.title')}
            subtitle={t('intro.astur.subtitle')}
            itemCountLabel={t('intro.astur.itemCount', { count: subtestCount })}
            durationLabel={t('intro.durationMin', { count: Math.max(5, subtestCount * 4) })}
            ctaLabel={t('intro.astur.cta')}
            onStart={handleStartBlockIntro}
          />
        )}

        {!isLoading && !loadError && subtest && stepPhase === 'instruction' && (subtestIndex > 0 || blockIntroSeen) && (
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
