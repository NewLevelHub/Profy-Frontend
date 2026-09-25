import { useCallback, useState } from 'react';
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
import { AsturCompleted } from './components/AsturCompleted';
import { RetakeConfirmModal } from './components/RetakeConfirmModal';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';

function blockIntroKey(scope: string) {
  return `profy-astur-block-intro-seen:${scope}`;
}

function readIntroSeen(scope: string): boolean {
  try {
    return sessionStorage.getItem(blockIntroKey(scope)) === '1';
  } catch {
    return false;
  }
}

export default function AsturPage() {
  const { t } = useTranslation('assessment');
  const navigate = useNavigate();
  const params = useParams<{ assessmentId: string }>();
  const storeAssessmentId = useAssessmentStore((s) => s.assessmentId);
  const effectiveAssessmentId = params.assessmentId || storeAssessmentId || '';

  const {
    isLoading,
    loadError,
    runId,
    completedAt,
    showCompleted,
    isRetake,
    subtest,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs,
    exitConfirmOpen,
    retakeConfirmOpen,
    retaking,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    openRetakeConfirm,
    cancelRetake,
    confirmRetake,
    submitting,
    submitError,
  } = useAsturAssessment(effectiveAssessmentId);

  // One-time "let's begin" moment per attempt (a retake gets it again).
  const introScope = runId ?? effectiveAssessmentId;
  const [seenScopes, setSeenScopes] = useState<Set<string>>(() => new Set());
  const blockIntroSeen = seenScopes.has(introScope) || readIntroSeen(introScope);

  function handleStartBlockIntro() {
    try {
      sessionStorage.setItem(blockIntroKey(introScope), '1');
    } catch {
      // sessionStorage unavailable — the intro just shows again after a reload.
    }
    setSeenScopes((prev) => new Set(prev).add(introScope));
  }

  const handleDoneContinue = useCallback(() => {
    navigate(isRetake ? '/results' : '/assessment/loading');
  }, [navigate, isRetake]);

  const ready = !isLoading && !loadError;
  const running = ready && !showCompleted && !allDone && subtest;
  const headerTitle = subtestCount > 0
    ? t('rail.subtestOf', { current: Math.min(subtestIndex + 1, subtestCount), total: subtestCount })
    : t('rail.sectionAstur');

  const progress = useAssessmentJourneyProgress({
    asturFraction:
      allDone || showCompleted
        ? 1
        : !blockIntroSeen || subtestCount === 0
          ? 0
          : subtestIndex / subtestCount,
  });

  return (
    <div className="min-h-screen bg-page">
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />
      <RetakeConfirmModal open={retakeConfirmOpen} pending={retaking} onConfirm={confirmRetake} onCancel={cancelRetake} />

      {running && (
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

        {ready && showCompleted && (
          <AsturCompleted completedAt={completedAt} onContinue={() => navigate('/results')} onRetake={openRetakeConfirm} />
        )}

        {running && stepPhase === 'instruction' && subtestIndex === 0 && !blockIntroSeen && (
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

        {running && stepPhase === 'instruction' && (subtestIndex > 0 || blockIntroSeen) && (
          <SubtestIntro subtest={subtest} index={subtestIndex} count={subtestCount} onStart={beginSubtest} />
        )}

        {running && stepPhase === 'running' && subtest.key === 'lability' && (
          <LabilityRunner
            subtest={subtest}
            itemLimitMs={labilityItemLimitMs}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers, elapsed_ms) => completeSubtest({ answers, elapsed_ms })}
          />
        )}

        {running && stepPhase === 'running' && subtest.key !== 'lability' && (
          <SubtestRunner
            subtest={subtest}
            submitting={submitting}
            submitError={submitError}
            onSubmit={(answers) => completeSubtest({ answers })}
          />
        )}

        {ready && allDone && <AsturDone isRetake={isRetake} onContinue={handleDoneContinue} />}
      </PageContainer>
    </div>
  );
}
