import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { useAssessment } from './hooks/useAssessment';
import { LikertScale } from './components/LikertScale';
import { PairChoice } from './components/PairChoice';

export default function AssessmentPage() {
  const {
    phase,
    itemIndex,
    totalItems,
    selectedValue,
    selectedPairOptionId,
    transitioning,
    saving,
    error,
    currentQuestion,
    currentPair,
    currentScale,
    progress,
    exitConfirmOpen,
    autofilling,
    handleBack,
    handleStartIntro,
    handleAnswer,
    handlePairAnswer,
    handleAutofill,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAssessment();

  const headerTitle =
    phase === 'question' && totalItems > 0
      ? `Вопрос ${itemIndex + 1} из ${totalItems}`
      : 'Тест RIASEC';

  return (
    <div className="flex flex-col min-h-screen bg-page">

      {/* ── Exit confirmation modal ─────────────────────────────────── */}
      {exitConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-dialog-title"
        >
          <div className="w-full max-w-sm bg-surface rounded-[var(--radius-lg)] shadow-pop p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 id="exit-dialog-title" className="text-title font-black text-primary">
                Выйти из теста?
              </h2>
              <p className="text-body text-secondary">
                Прогресс сохранён, продолжишь позже
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="lg" className="w-full rounded-pill" onClick={confirmExit}>
                Выйти
              </Button>
              <Button variant="ghost" size="lg" className="w-full rounded-pill" onClick={cancelExit}>
                Остаться
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-7 pt-[18px] pb-4"
        style={{ background: 'rgba(245,243,255,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between max-w-[980px] mx-auto mb-[14px]">
          {phase === 'question' && itemIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Назад"
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-surface text-secondary text-[18px] transition-colors hover:bg-brand-subtle flex-shrink-0"
              style={{ boxShadow: '0 2px 8px rgba(30,27,75,.06)' }}
            >
              ←
            </button>
          ) : (
            <div className="w-[38px] h-[38px] flex-shrink-0" />
          )}

          <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
            {headerTitle}
          </span>

          <div className="flex items-center gap-2 flex-shrink-0">
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleAutofill}
                disabled={autofilling}
                aria-label="Автозаполнить тест (dev)"
                title="Автозаполнить тест случайными ответами (только в dev)"
                className="h-[38px] px-3 flex items-center justify-center gap-1 rounded-pill bg-surface text-secondary text-[13px] font-bold transition-colors hover:bg-brand-subtle hover:text-brand disabled:opacity-50"
                style={{ boxShadow: '0 2px 8px rgba(30,27,75,.06)' }}
              >
                {autofilling ? '…' : '⚡ Автозаполнить'}
              </button>
            )}
            <button
              type="button"
              onClick={handleExit}
              aria-label="Выйти из теста"
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-danger-subtle hover:text-danger flex-shrink-0"
              style={{ boxShadow: '0 2px 8px rgba(30,27,75,.06)', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-w-[980px] mx-auto">
          <div className="h-3 bg-brand-subtle rounded-pill overflow-hidden relative">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7C3AED,#A855F7)' }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогресс теста"
            />
          </div>
          <div className="flex justify-between mt-2 mx-0.5" style={{ fontSize: 12 }}>
            <span className="font-bold text-muted">Тест RIASEC</span>
            <span className="font-bold text-muted">{Math.round(progress)}%</span>
          </div>
        </div>
      </header>

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
                Тест RIASEC
              </span>
              <h2 className="font-black text-primary mb-[14px] tracking-[-0.02em]" style={{ fontSize: 44 }}>
                Узнаем твои склонности
              </h2>
              <p className="font-semibold leading-relaxed mb-[30px]" style={{ fontSize: 19, color: '#6B7280' }}>
                Отвечай честно: правильных и неправильных ответов здесь нет
              </p>
              <div className="flex items-center justify-center gap-[18px] font-bold" style={{ fontSize: 14, color: '#9CA3AF' }}>
                <span className="inline-flex items-center gap-[6px]">📝 {totalItems} вопросов</span>
                <span className="w-[4px] h-[4px] rounded-full" style={{ background: '#C4B5FD' }} />
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
                  background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
                  boxShadow: '0 10px 22px rgba(124,58,237,.32)',
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

              {currentQuestion !== undefined && (
                <div
                  className={cn(
                    'transition-opacity duration-300',
                    transitioning ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  <h2
                    className="font-black text-primary mb-8 leading-snug tracking-[-0.01em] text-subtitle"
                    style={{ fontSize: 28 }}
                  >
                    {currentQuestion.text}
                  </h2>
                  <LikertScale selected={selectedValue} onSelect={handleAnswer} scale={currentScale} />
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
          </div>
        )}
      </div>
    </div>
  );
}
