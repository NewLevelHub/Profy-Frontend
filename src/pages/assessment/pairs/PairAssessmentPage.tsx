import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { Heading } from '@/shared/ui/typography/Heading';
import { usePairAssessment } from '../hooks/usePairAssessment';
import { PairChoice } from '../components/PairChoice';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';
import { AssessmentIntro } from '../components/AssessmentIntro';

export default function PairAssessmentPage() {
  const {
    phase,
    pairIndex,
    totalPairs,
    selectedId,
    transitioning,
    saving,
    error,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleAnswer,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = usePairAssessment();

  const headerTitle =
    phase === 'question' && totalPairs > 0
      ? `Вопрос ${pairIndex + 1} из ${totalPairs}`
      : 'Выбери, что тебе ближе';

  return (
    <div className="flex flex-col min-h-screen bg-page">

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

      {/* ── Rail (progress · sound · exit) ────────────────────────── */}
      <AssessmentRail
        title={headerTitle}
        sectionLabel="Выбери, что тебе ближе"
        progressAriaLabel="Прогресс теста"
        progress={progress}
        showBack={phase === 'question' && pairIndex > 0}
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
            emoji="🧭"
            kicker="Узнаём тебя"
            title="Выбирай, что тебе ближе"
            subtitle="Правильных и неправильных ответов здесь нет"
            itemCountLabel={`📝 ${totalPairs} вопросов`}
            durationLabel={`⏱ ~${Math.max(1, Math.ceil(totalPairs / 20))} мин`}
            ctaLabel="Начать тест"
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
                    Попробовать снова
                  </button>
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
                    onSelect={handleAnswer}
                    selected={selectedId}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
