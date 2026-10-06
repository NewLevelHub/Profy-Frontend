import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Spinner } from '@/shared/ui/Spinner';
import { Text } from '@/shared/ui/typography/Text';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useAssessmentStore } from '@/shared/store/assessment';
import { afterBatteryRoute } from '@/shared/store/psychoemotional';
import { useAssessmentJourneyProgress } from '../hooks/useAssessmentJourneyProgress';
import { useAsturAssessment } from './hooks/useAsturAssessment';
import { SubtestIntro } from './components/SubtestIntro';
import { SubtestRunner } from './components/SubtestRunner';
import { LabilityRunner } from './components/LabilityRunner';
import { AsturDone } from './components/AsturDone';
import { AsturCompleted } from './components/AsturCompleted';
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
    subtest,
    subtestStartedAt,
    subtestIndex,
    subtestCount,
    stepPhase,
    allDone,
    labilityItemLimitMs,
    maxMinutes,
    exitConfirmOpen,
    exiting,
    exitError,
    starting,
    beginSubtest,
    completeSubtest,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    submitting,
    submitError,
  } = useAsturAssessment(effectiveAssessmentId);

  // One-time "let's begin" moment per attempt.
  const introScope = runId ?? effectiveAssessmentId;
  const [seenScopes, setSeenScopes] = useState<Set<string>>(() => new Set());
  const blockIntroSeen = seenScopes.has(introScope) || readIntroSeen(introScope);

  // The rail's status slot — SubtestRunner portals its countdown into it.
  const [railStatusSlot, setRailStatusSlot] = useState<HTMLDivElement | null>(null);

  function handleStartBlockIntro() {
    try {
      sessionStorage.setItem(blockIntroKey(introScope), '1');
    } catch {
      // sessionStorage unavailable — the intro just shows again after a reload.
    }
    setSeenScopes((prev) => new Set(prev).add(introScope));
  }

  const handleDoneContinue = useCallback(() => {
    navigate(afterBatteryRoute(effectiveAssessmentId));
  }, [navigate, effectiveAssessmentId]);

  const ready = !isLoading && !loadError;
  const running = ready && !showCompleted && !allDone && subtest;
  const headerTitle = subtestCount > 0
    ? t('rail.subtestOf', { current: Math.min(subtestIndex + 1, subtestCount), total: subtestCount })
    : t('rail.sectionAstur');

  // Submitted subtests over all of them, from the server — not gated on the
  // block intro: that flag lives in sessionStorage, so a resume in a new tab
  // dropped the rail back to 0% of АСТУР with subtests already done (PRO-439).
  const progress = useAssessmentJourneyProgress({
    asturFraction: allDone || showCompleted ? 1 : subtestCount === 0 ? 0 : subtestIndex / subtestCount,
  });

  // Both start gates (block intro + per-subtest intro) are stage moments that
  // own the screen and center themselves, so they render outside the
  // top-anchored PageContainer the running subtest uses — see BelbinPage for
  // the same split (PRO-397).
  const showIntro = !!running && stepPhase === 'instruction';

  return (
    <div className="flex flex-col min-h-screen bg-page">
      <ExitAssessmentModal
        open={exitConfirmOpen}
        title={t('astur.exit.title')}
        body={t('astur.exit.body')}
        saveAndExitLabel={t('astur.exit.confirm')}
        error={exitError}
        exiting={exiting}
        onSaveAndExit={confirmExit}
        onContinue={cancelExit}
      />

      {running && (
        <AssessmentRail
          title={headerTitle}
          sectionLabel={t('rail.sectionAstur')}
          progressAriaLabel={t('rail.progressAriaAstur')}
          progress={progress}
          onExit={handleExit}
          exitDisabled={starting || submitting}
          devAutofill={{ onClick: handleAutofill, loading: submitting }}
          statusSlotRef={setRailStatusSlot}
        />
      )}

      {showIntro && subtestIndex === 0 && !blockIntroSeen && (
        <AssessmentIntro
          kicker={t('intro.astur.kicker')}
          title={t('intro.astur.title')}
          subtitle={t('intro.astur.subtitle')}
          itemCountLabel={t('intro.astur.itemCount', { count: subtestCount })}
          durationLabel={t('intro.durationUpToMin', { count: maxMinutes })}
          ctaLabel={t('intro.astur.cta')}
          onStart={handleStartBlockIntro}
          secondaryCtaLabel={t('intro.astur.pause')}
          onSecondaryAction={() => navigate('/results')}
        />
      )}

      {showIntro && (subtestIndex > 0 || blockIntroSeen) && (
        <>
          <SubtestIntro
            subtest={subtest}
            index={subtestIndex}
            count={subtestCount}
            labilityItemLimitMs={labilityItemLimitMs}
            starting={starting}
            onStart={beginSubtest}
          />
          {submitError && (
            <Text variant="body-sm" className="text-danger text-center pb-8">
              {submitError}
            </Text>
          )}
        </>
      )}

      {!showIntro && (
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
            <AsturCompleted completedAt={completedAt} onContinue={() => navigate('/results')} />
          )}

          {running && stepPhase === 'running' && subtest.key === 'lability' && (
            <LabilityRunner
              subtest={subtest}
              runId={runId ?? ''}
              startedAt={subtestStartedAt}
              itemLimitMs={labilityItemLimitMs}
              submitting={submitting}
              submitError={submitError}
              onSubmit={completeSubtest}
            />
          )}

          {running && stepPhase === 'running' && subtest.key !== 'lability' && (
            <SubtestRunner
              subtest={subtest}
              startedAt={subtestStartedAt}
              timerSlot={railStatusSlot}
              submitting={submitting}
              submitError={submitError}
              onSubmit={completeSubtest}
            />
          )}

          {ready && allDone && <AsturDone onContinue={handleDoneContinue} />}
        </PageContainer>
      )}
    </div>
  );
}
