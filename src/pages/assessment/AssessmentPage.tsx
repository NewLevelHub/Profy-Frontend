import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { Heading } from '@/shared/ui/typography/Heading';
import { Text } from '@/shared/ui/typography/Text';
import { useAssessment } from './hooks/useAssessment';
import { LikertPage } from './components/LikertPage';
import { PairChoice } from './components/PairChoice';
import { ExitAssessmentModal } from './components/ExitAssessmentModal';
import { AssessmentIntro } from './components/AssessmentIntro';

export default function AssessmentPage() {
  const { t } = useTranslation('assessment');
  const {
    phase,
    pageIndex,
    totalPages,
    totalItems,
    likertAnswers,
    selectedPairOptionId,
    transitioning,
    saving,
    savingVisible,
    error,
    currentLikertQuestions,
    currentPair,
    isAdditionalTestsSection,
    testIntroInstrument,
    testIntroItemCount,
    progress,
    exitConfirmOpen,
    exiting,
    autofilling,
    handleBack,
    handleStartIntro,
    handleStartTestIntro,
    handleLikertSelect,
    handleSubmitLikertPage,
    handlePairAnswer,
    handleAutofill,
    handleAutofillToMotivation,
    handleAutofillToAstur,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAssessment();

  // PRO-338 Ф0.8: professional_types_abilities/eysenck/elers render as one
  // contiguous, non-interleaved sub-section right after MI — the rail's
  // section label switches for exactly that run of pages (see
  // useAssessment's isAdditionalTestsSection).
  const sectionLabel = isAdditionalTestsSection
    ? t('rail.sectionAdditionalTests')
    : t('rail.sectionDiagnostic');
  const headerTitle =
    phase === 'question' && !testIntroInstrument && totalPages > 0
      ? t('rail.pageOf', { current: pageIndex + 1, total: totalPages })
      : sectionLabel;

  return (
    <div className="flex flex-col min-h-screen bg-page">

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal
        open={exitConfirmOpen}
        onSaveAndExit={confirmExit}
        onContinue={cancelExit}
        exiting={exiting}
      />

      {/* ── Rail (progress · sound · exit) ────────────────────────── */}
      <AssessmentRail
        title={headerTitle}
        sectionLabel={sectionLabel}
        progressAriaLabel={t('rail.progressAriaTest')}
        progress={progress}
        showBack={phase === 'question' && !testIntroInstrument && pageIndex > 0}
        onBack={handleBack}
        onExit={handleExit}
        devAutofill={{ onClick: handleAutofill, loading: autofilling }}
        devAutofillToMotivation={{ onClick: handleAutofillToMotivation, loading: autofilling }}
        devAutofillToAstur={{ onClick: handleAutofillToAstur, loading: autofilling }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">

        {phase === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {phase === 'intro' && (
          <AssessmentIntro
            kicker={t('intro.diagnostic.kicker')}
            title={t('intro.diagnostic.title')}
            subtitle={t('intro.diagnostic.subtitle')}
            itemCountLabel={t('intro.itemCount', { count: totalItems })}
            durationLabel={t('intro.durationMin', { count: Math.max(1, Math.ceil(totalItems / 20)) })}
            ctaLabel={t('intro.diagnostic.cta')}
            onStart={handleStartIntro}
          />
        )}

        {phase === 'question' && testIntroInstrument && (
          <AssessmentIntro
            kicker={t(`intro.tests.${testIntroInstrument}.kicker`)}
            title={t(`intro.tests.${testIntroInstrument}.title`)}
            subtitle={t(`intro.tests.${testIntroInstrument}.subtitle`)}
            itemCountLabel={t('intro.itemCount', { count: testIntroItemCount })}
            durationLabel={t('intro.durationMin', { count: Math.max(1, Math.ceil(testIntroItemCount / 20)) })}
            ctaLabel={t('intro.diagnostic.cta')}
            onStart={() => handleStartTestIntro(testIntroInstrument)}
          />
        )}

        {phase === 'question' && !testIntroInstrument && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-3 py-8 sm:px-4 lg:px-6">

              {error !== null && (
                <div className="mb-4 p-3 rounded-xl bg-danger-subtle text-danger text-caption text-center">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-2 font-semibold underline">
                    {t('error.retry')}
                  </button>
                </div>
              )}

              {currentLikertQuestions !== undefined && (
                <div
                  className={cn(
                    'transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <LikertPage
                    questions={currentLikertQuestions}
                    answers={likertAnswers}
                    onSelect={handleLikertSelect}
                    onSubmit={handleSubmitLikertPage}
                    saving={saving}
                    savingVisible={savingVisible}
                  />
                </div>
              )}

              {currentPair !== undefined && (
                <div
                  className={cn(
                    'transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <Heading level="display-md" as="h2" className="text-primary mb-8 text-center">
                    {t('format.pickCloser')}
                  </Heading>
                  <PairChoice
                    frame={currentPair.frame}
                    optionA={currentPair.option_a}
                    optionB={currentPair.option_b}
                    onSelect={handlePairAnswer}
                    selected={selectedPairOptionId}
                  />
                </div>
              )}
            </div>

            {currentLikertQuestions !== undefined && (
              <div className="px-3 py-5 sm:px-4 lg:px-6" style={{ borderTop: '1px solid var(--line)' }}>
                <Text variant="body-sm" className="text-muted">
                  {t('format.noWrongAnswers')}
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
