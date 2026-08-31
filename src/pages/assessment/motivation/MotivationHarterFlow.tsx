import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { Heading } from '@/shared/ui/typography/Heading';
import { useMotivationHarter } from '../hooks/useMotivationHarter';
import { HarterChoice } from '../components/HarterChoice';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';
import { AssessmentIntro } from '../components/AssessmentIntro';

// Junior/middle's motivation format — Harter's Structured Alternative
// Format (SPPC): pick a camp, then rate intensity, instead of the 3-way
// MOST/LEAST triplets senior uses (MotivationTripletFlow.tsx).
export default function MotivationHarterFlow() {
  const {
    phase,
    pairIndex,
    totalPairs,
    chosenSide,
    transitioning,
    saving,
    error,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleSelectSide,
    handleSelectIntensity,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useMotivationHarter();

  const headerTitle =
    phase === 'question' && totalPairs > 0
      ? `Вопрос ${pairIndex + 1} из ${totalPairs}`
      : 'Что тебя драйвит';

  return (
    <div className="flex flex-col min-h-screen bg-page">

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

      {/* ── Rail (progress · sound · exit) ────────────────────────── */}
      <AssessmentRail
        title={headerTitle}
        sectionLabel="Что тебя драйвит"
        progressAriaLabel="Прогресс блока мотивации"
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
            kicker="Последний блок"
            title="Что тебя драйвит"
            subtitle="Выбери, какие ребята тебе ближе — а потом уточни, насколько точно"
            itemCountLabel={`${totalPairs} вопросов`}
            durationLabel="~2 мин"
            ctaLabel="Начать"
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
                  <Heading level="display-sm" as="h2" className="text-primary mb-6 text-center">
                    Какие ребята тебе ближе?
                  </Heading>
                  <HarterChoice
                    textA={currentPair.text_a}
                    textB={currentPair.text_b}
                    onSelect={handleSelectSide}
                    selected={chosenSide}
                  />

                  {chosenSide !== null && (
                    <div className="flex flex-col gap-2 mt-6" style={{ animation: 'fade-in-up 0.3s ease both' }}>
                      <p className="text-caption text-secondary text-center mb-1">Насколько это про тебя?</p>
                      <Button
                        onClick={() => handleSelectIntensity('high')}
                        disabled={saving}
                        size="lg"
                        className="w-full rounded-pill"
                      >
                        Точно про меня
                      </Button>
                      <Button
                        onClick={() => handleSelectIntensity('medium')}
                        disabled={saving}
                        variant="ghost"
                        size="lg"
                        className="w-full rounded-pill"
                      >
                        Немного про меня
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
