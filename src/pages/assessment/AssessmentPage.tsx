import { AssessmentLayout } from './components/AssessmentLayout';
import { cn } from '@/shared/lib/cn';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { Text } from '@/shared/ui/typography/Text';
import { useAssessment } from './hooks/useAssessment';
import { LikertPage } from './components/LikertPage';
import { PairPage } from './components/PairPage';
import { ExitAssessmentModal } from './components/ExitAssessmentModal';
import { AssessmentIntro } from './components/AssessmentIntro';
import { ASSESSMENT_PHASE_MINUTES, SECONDS_PER_LIKERT_ITEM } from '@/shared/config/constants';

export default function AssessmentPage() {
  const { t } = useTranslation('assessment');
  const {
    phase,
    pageIndex,
    totalItems,
    likertAnswers,
    pairAnswers,
    transitioning,
    saving,
    savingVisible,
    error,
    currentLikertQuestions,
    currentPairs,
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
    handlePairSelect,
    handleSubmitPairPage,
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
  // No "Страница N из M" while answering: 88 pages read as an endless test.
  // The section label + percentage under the bar carry the progress instead.
  const headerTitle =
    phase === 'question' && !testIntroInstrument ? undefined : sectionLabel;

  return (
    <AssessmentLayout>

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal
        redesigned
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
        showBack={phase === 'question' && pageIndex > 0}
        onBack={handleBack}
        onExit={handleExit}
        devAutofill={{ onClick: handleAutofill, loading: autofilling }}
        devAutofillToMotivation={{ onClick: handleAutofillToMotivation, loading: autofilling }}
        devAutofillToAstur={{ onClick: handleAutofillToAstur, loading: autofilling }}
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
            kicker={t('intro.diagnostic.kicker')}
            title={t('intro.diagnostic.title')}
            subtitle={t('intro.diagnostic.subtitle')}
            itemCountLabel={t('intro.itemCount', { count: totalItems })}
            durationLabel={t('intro.durationMin', { count: ASSESSMENT_PHASE_MINUTES.diagnostic })}
            ctaLabel={t('intro.diagnostic.cta')}
            onStart={handleStartIntro}
          />
        )}

        {phase === 'question' && testIntroInstrument && (
          <AssessmentIntro
            illustrated
            kicker={t(`intro.tests.${testIntroInstrument}.kicker`)}
            title={t(`intro.tests.${testIntroInstrument}.title`)}
            subtitle={t(`intro.tests.${testIntroInstrument}.subtitle`)}
            itemCountLabel={t('intro.itemCount', { count: testIntroItemCount })}
            durationLabel={t('intro.durationMin', {
              count: Math.max(1, Math.ceil((testIntroItemCount * SECONDS_PER_LIKERT_ITEM) / 60)),
            })}
            ctaLabel={t('intro.diagnostic.cta')}
            onStart={() => handleStartTestIntro(testIntroInstrument)}
          />
        )}

        {phase === 'question' && !testIntroInstrument && (
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

              {currentPairs !== undefined && (
                <div
                  className={cn(
                    'transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <PairPage
                    pairs={currentPairs}
                    answers={pairAnswers}
                    onSelect={handlePairSelect}
                    onSubmit={handleSubmitPairPage}
                    saving={saving}
                    savingVisible={savingVisible}
                  />
                </div>
              )}
            </div>

            {(currentLikertQuestions !== undefined || currentPairs !== undefined) && (
              <div className="rd-assessment-reassurance">
                <Text variant="body-sm" className="text-muted">
                  {t('format.noWrongAnswers')}
                </Text>
              </div>
            )}
          </div>
        )}
      </main>
    </AssessmentLayout>
  );
}
