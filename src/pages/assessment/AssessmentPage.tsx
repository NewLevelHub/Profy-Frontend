import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { Spinner } from '@/shared/ui/Spinner';
import { BLOCK_NAMES, BLOCK_EMOJIS, BLOCK_DESCRIPTIONS } from '@/shared/config/constants';
import { useAssessment } from './hooks/useAssessment';
import { OptionCard } from './components/OptionCard';

export default function AssessmentPage() {
  const {
    phase,
    questions,
    questionIndex,
    selectedIndex,
    transitioning,
    saving,
    error,
    currentBlock,
    currentBlockKey,
    totalBlocks,
    ageGroup,
    currentQuestion,
    showNextButton,
    questionProgress,
    overallProgress,
    isRetakeMode,
    exitConfirmOpen,
    handleBack,
    handleOptionSelect,
    handleNextBlock,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAssessment();

  const blockName = currentBlockKey ? BLOCK_NAMES[currentBlockKey] : '';
  const blockEmoji = currentBlockKey ? BLOCK_EMOJIS[currentBlockKey] : '';
  const blockDesc = currentBlockKey ? BLOCK_DESCRIPTIONS[currentBlockKey] : '';

  const headerTitle = isRetakeMode
    ? phase === 'question' && questions.length > 0
      ? `Перепрохождение · ${questionIndex + 1} / ${questions.length}`
      : `Перепрохождение: ${blockName}`
    : phase === 'question' && questions.length > 0
    ? `${blockName} · ${questionIndex + 1} / ${questions.length}`
    : blockName;

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
              <Button
                size="lg"
                className="w-full rounded-pill"
                onClick={confirmExit}
              >
                Выйти
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full rounded-pill"
                onClick={cancelExit}
              >
                Остаться
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 bg-page sticky top-0 z-10">
        {phase === 'question' && questionIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Назад"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-raised transition-colors text-secondary text-lg"
          >
            ←
          </button>
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}
        <span className="flex-1 text-center text-label font-semibold text-primary truncate">
          {headerTitle}
        </span>
        <button
          type="button"
          onClick={handleExit}
          aria-label="Выйти из теста"
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-raised transition-colors text-muted text-sm"
        >
          ✕
        </button>
      </header>

      {/* ── Progress bars ───────────────────────────────────────────── */}
      <div className="px-4 pb-3 space-y-1.5">
        <ProgressBar value={questionProgress} variant="brand" label="Прогресс вопросов" />
        <div className="flex items-center justify-between">
          <span
            className="text-tiny text-muted"
            style={{ fontSize: 'var(--text-tiny)' }}
          >
            {isRetakeMode ? 'Перепрохождение блока' : `Блок ${currentBlock + 1} из ${totalBlocks}`}
          </span>
          <span
            className="text-tiny text-muted"
            style={{ fontSize: 'var(--text-tiny)' }}
          >
            {Math.round(overallProgress)}%
          </span>
        </div>
        <ProgressBar value={overallProgress} variant="accent" label="Общий прогресс" />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* Block intro splash (~2s) */}
        {phase === 'intro' && (
          <div
            key={`intro-${currentBlock}`}
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
            style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}
          >
            <span className="text-5xl mb-6" role="img" aria-hidden>{blockEmoji}</span>
            <span className="inline-block bg-brand-subtle text-brand text-caption font-semibold px-4 py-1 rounded-pill mb-4">
              Блок {currentBlock + 1} из {totalBlocks}
            </span>
            <h2 className="text-h1 font-extrabold text-primary mb-3">{blockName}</h2>
            <p className="text-body text-secondary">{blockDesc}</p>
          </div>
        )}

        {/* Questions */}
        {phase === 'question' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-4">

              {error !== null && (
                <div className="mb-4 p-3 rounded-xl bg-danger-subtle text-danger text-caption text-center">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-2 font-semibold underline"
                  >
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
                    className={cn(
                      'font-extrabold text-primary mb-6 leading-snug',
                      ageGroup === 'junior' ? 'text-title' : 'text-subtitle',
                    )}
                  >
                    {currentQuestion.text}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map(opt => (
                      <OptionCard
                        key={opt.index}
                        text={opt.text}
                        index={opt.index}
                        selected={selectedIndex === opt.index}
                        ageGroup={ageGroup}
                        onPress={() => handleOptionSelect(currentQuestion.id, opt.index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {showNextButton && (
              <div className="px-4 pt-3 pb-8">
                <Button
                  onClick={handleNextBlock}
                  isLoading={saving}
                  disabled={saving}
                  size="lg"
                  className="w-full rounded-pill shadow-button"
                >
                  Дальше
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
