import { cn } from '@/shared/lib/cn';
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
    progress,
    exitConfirmOpen,
    exiting,
    autofilling,
    autofillingToMotivation,
    handleBack,
    handleStartIntro,
    handleLikertSelect,
    handleSubmitLikertPage,
    handlePairAnswer,
    handleAutofill,
    handleAutofillToMotivation,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAssessment();

  const headerTitle =
    phase === 'question' && totalPages > 0
      ? `Страница ${pageIndex + 1} из ${totalPages}`
      : 'Диагностика';

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
        sectionLabel="Диагностика"
        progressAriaLabel="Прогресс теста"
        progress={progress}
        showBack={phase === 'question' && pageIndex > 0}
        onBack={handleBack}
        onExit={handleExit}
        devAutofill={{ onClick: handleAutofill, loading: autofilling }}
        devAutofillToMotivation={{ onClick: handleAutofillToMotivation, loading: autofillingToMotivation }}
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
            kicker="Диагностика"
            title="Узнаем твои склонности"
            subtitle="Отвечай честно: правильных и неправильных ответов здесь нет"
            itemCountLabel={`${totalItems} вопросов`}
            durationLabel={`~${Math.max(1, Math.ceil(totalItems / 20))} мин`}
            ctaLabel="Начать тест"
            onStart={handleStartIntro}
          />
        )}

        {phase === 'question' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-3 py-8 sm:px-4 lg:px-6">

              {error !== null && (
                <div className="mb-4 p-3 rounded-xl bg-danger-subtle text-danger text-caption text-center">
                  <p>{error}</p>
                  <button type="button" onClick={retry} className="mt-2 font-semibold underline">
                    Попробовать снова
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
                    Что тебе ближе?
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
                  Нет неправильных ответов
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
