import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { useMotivationAssessment } from '../hooks/useMotivationAssessment';
import { TripletRanking } from '../components/TripletRanking';
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
    <div className="flex flex-col min-h-screen bg-page">

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

      {/* ── Rail (progress · sound · exit) ────────────────────────── */}
      <AssessmentRail
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
      <div className="flex-1 flex flex-col max-w-2xl lg:max-w-4xl mx-auto w-full">

        {phase === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {phase === 'intro' && (
          <AssessmentIntro
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
            <div className="flex-1 overflow-y-auto px-4 py-4">

              {error !== null && (
                <div className="mb-4 p-3 rounded-xl bg-danger-subtle text-danger text-caption text-center">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-2 font-semibold underline">
                    {t('error.retry')}
                  </button>
                </div>
              )}

              {currentTriplet !== undefined && (
                <div
                  className={cn(
                    'transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <Heading level="display-sm" as="h2" className="text-primary mb-2">
                    {t('format.rankPriority')}
                  </Heading>
                  <Text variant="caption" className="text-secondary mb-6">
                    {t('format.dragToTop')}
                  </Text>
                  <TripletRanking
                    statements={orderedStatements}
                    onReorder={handleReorder}
                    disabled={saving || transitioning}
                  />
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={saving || transitioning}
                    aria-pressed={hasInteracted}
                    className={cn(
                      'mt-3 inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      hasInteracted ? 'text-brand' : 'text-secondary hover:text-primary',
                    )}
                  >
                    <Check size={14} aria-hidden />
                    {hasInteracted ? t('triplet.orderConfirmed') : t('triplet.confirmOrder')}
                  </button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || saving}
                    size="lg"
                    className="w-full rounded-pill mt-6"
                  >
                    {t('priority.continue')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
