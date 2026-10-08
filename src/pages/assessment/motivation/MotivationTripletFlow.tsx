import { MotivationQuestion } from './MotivationQuestion';
import { AssessmentLayout } from '../components/AssessmentLayout';
import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useMotivationAssessment } from '../hooks/useMotivationAssessment';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { ASSESSMENT_PHASE_MINUTES } from '@/shared/config/constants';

// Motivation block — 12 triplets, MOST/LEAST forced choice via
// drag-and-drop ranking.
export default function MotivationTripletFlow() {
  const { t } = useTranslation('assessment');
  const {
    phase,
    tripletIndex,
    totalTriplets,
    orderedStatements,
    transitioning,
    saving,
    error,
    currentTriplet,
    canProceed,
    progress,
    hasInteracted,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleReorder,
    handleConfirmOrder,
    handleNext,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useMotivationAssessment();

  const headerTitle =
    phase === 'question' && totalTriplets > 0
      ? t('rail.questionOf', { current: tripletIndex + 1, total: totalTriplets })
      : t('rail.sectionMotivation');

  return (
    <AssessmentLayout>

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal
        redesigned
        title={t('redesign.motivationExitTitle')}
        body={t('redesign.motivationExitBody', { continueLabel: t('priority.continue') })}
        saveAndExitLabel={t('rail.exit')}
        open={exitConfirmOpen}
        onSaveAndExit={confirmExit}
        onContinue={cancelExit}
      />

      {/* ── Rail (progress · sound · exit) ────────────────────────── */}
      <AssessmentRail
        redesigned
        title={headerTitle}
        sectionLabel={t('rail.sectionMotivation')}
        progressAriaLabel={t('rail.progressAriaMotivation')}
        progress={progress}
        showBack={phase === 'question' && tripletIndex > 0}
        onBack={handleBack}
        onExit={handleExit}
        devAutofill={{ onClick: handleAutofill, loading: autofilling }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main id="assessment-content" tabIndex={-1} className="rd-assessment-main">

        {phase === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {phase === 'intro' && (
          <AssessmentIntro
            illustrated
            kicker={t('intro.motivationTriplet.kicker')}
            title={t('intro.motivationTriplet.title')}
            subtitle={t('intro.motivationTriplet.subtitle')}
            itemCountLabel={t('intro.itemCount', { count: totalTriplets })}
            durationLabel={t('intro.durationMin', { count: ASSESSMENT_PHASE_MINUTES.motivation })}
            ctaLabel={t('intro.motivationTriplet.cta')}
            onStart={handleStartIntro}
          />
        )}

        {phase === 'question' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="rd-assessment-workspace">

              {error !== null && (
                <div role="alert" className="rd-assessment-error">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-2 font-semibold underline">
                    {t('error.retry')}
                  </button>
                </div>
              )}

              {currentTriplet !== undefined && (
                <div
                  className={cn(
                    'rd-assessment-ranking transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <MotivationQuestion
                    statements={orderedStatements}
                    onReorder={handleReorder}
                    onConfirm={handleConfirmOrder}
                    confirmed={hasInteracted}
                    onNext={handleNext}
                    canProceed={canProceed}
                    disabled={saving || transitioning}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </AssessmentLayout>
  );
}
