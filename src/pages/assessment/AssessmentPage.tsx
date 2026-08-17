import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { AssessmentRail } from '@/shared/ui/navigation/AssessmentRail';
import { useAssessment } from './hooks/useAssessment';
import { LikertPage } from './components/LikertPage';
import { PairChoice } from './components/PairChoice';
import { ExitAssessmentModal } from './components/ExitAssessmentModal';

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
    error,
    currentLikertQuestions,
    currentPair,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleLikertSelect,
    handleSubmitLikertPage,
    handlePairAnswer,
    handleAutofill,
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
      <ExitAssessmentModal open={exitConfirmOpen} onSaveAndExit={confirmExit} onContinue={cancelExit} />

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
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">

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
                Диагностика
              </span>
              <h2 className="font-black text-primary mb-[14px] tracking-[-0.02em]" style={{ fontSize: 44 }}>
                Узнаем твои склонности
              </h2>
              <p className="font-semibold leading-relaxed mb-[30px]" style={{ fontSize: 19, color: '#6B7280' }}>
                Отвечай честно: правильных и неправильных ответов здесь нет
              </p>
              <div className="flex items-center justify-center gap-[18px] font-bold" style={{ fontSize: 14, color: '#9CA3AF' }}>
                <span className="inline-flex items-center gap-[6px]">📝 {totalItems} вопросов</span>
                <span className="w-[4px] h-[4px] rounded-full" style={{ background: 'var(--hairline)' }} />
                <span className="inline-flex items-center gap-[6px]">⏱ ~{Math.max(1, Math.ceil(totalItems / 20))} мин</span>
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
                    onSelect={handlePairAnswer}
                    selected={selectedPairOptionId}
                  />
                </div>
              )}
            </div>

            {currentLikertQuestions !== undefined && (
              <div className="px-3 py-5 sm:px-4 lg:px-6" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-[15px]" style={{ color: 'var(--mute)' }}>
                  Нет неправильных ответов
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
