import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { usePairAssessment } from '../hooks/usePairAssessment';
import { PairChoice } from '../components/PairChoice';
import { ExitAssessmentModal } from '../components/ExitAssessmentModal';

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
          <>
            <div
              className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-[130px] lg:pb-8"
              style={{ animation: 'fade-in-up 0.5s ease both' }}
            >
              <span className="inline-block mb-[18px]" role="img" aria-hidden style={{ fontSize: 74, animation: 'pf-float 3s ease-in-out infinite' }}>🧭</span>
              <span className="inline-block bg-brand-subtle text-brand font-extrabold px-[18px] py-[7px] rounded-pill mb-[22px]" style={{ fontSize: 14 }}>
                Узнаём тебя
              </span>
              <h2 className="font-black text-primary mb-[14px] tracking-[-0.02em]" style={{ fontSize: 44 }}>
                Выбирай, что тебе ближе
              </h2>
              <p className="font-semibold leading-relaxed mb-[30px]" style={{ fontSize: 19, color: '#6B7280' }}>
                Правильных и неправильных ответов здесь нет
              </p>
              <div className="flex items-center justify-center gap-[18px] font-bold" style={{ fontSize: 14, color: '#9CA3AF' }}>
                <span className="inline-flex items-center gap-[6px]">📝 {totalPairs} вопросов</span>
                <span className="w-[4px] h-[4px] rounded-full" style={{ background: 'var(--hairline)' }} />
                <span className="inline-flex items-center gap-[6px]">⏱ ~{Math.max(1, Math.ceil(totalPairs / 20))} мин</span>
              </div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 px-6 pb-[22px] pt-[18px] flex justify-center lg:static lg:px-8 lg:pb-8">
              <Button
                onClick={handleStartIntro}
                size="lg"
                className="w-full max-w-[560px] lg:max-w-md rounded-pill"
                style={{
                  height: 60,
                  fontSize: 18,
                  fontWeight: 800,
                  background: 'var(--brand)',
                  animation: 'pf-pulse 2.4s infinite',
                }}
              >
                Начать тест
              </Button>
            </div>
          </>
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
                  <h2
                    className="font-black text-primary mb-8 leading-snug tracking-[-0.01em] text-subtitle text-center"
                    style={{ fontSize: 28 }}
                  >
                    Что тебе ближе?
                  </h2>
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
