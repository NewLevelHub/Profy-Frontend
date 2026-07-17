import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { OptionCard } from './OptionCard';
import { RevealCard } from './reveal/RevealCard';
import { SimulationCard } from './simulation/SimulationCard';
import { useAkinatorAssessment } from '../hooks/useAkinatorAssessment';

export function AkinatorAssessmentView() {
  const {
    assessmentId,
    isLoading,
    saving,
    error,
    question,
    reveal,
    step,
    simulatingLeaf,
    selectedIndex,
    transitioning,
    exitConfirmOpen,
    questionProgress,
    ageGroup,
    handleOptionSelect,
    handleBack,
    handleReject,
    handleRejectAll,
    handleFeedback,
    handleRetakeTest,
    handleLikeLeaf,
    handleSimulationCancel,
    handleSimulationAccept,
    handleSimulationReject,
    handleExit,
    confirmExit,
    cancelExit,
    retry,
  } = useAkinatorAssessment();

  const headerTitle = simulatingLeaf
    ? `Проба: ${simulatingLeaf.name}`
    : question
    ? `Вопрос ${step + 1}`
    : reveal
    ? 'Результаты подобраны!'
    : 'Анализ';

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
                Прогресс сохранён, ты сможешь продолжить позже.
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
                Остаться в тесте
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
          <div className="w-[38px] h-[38px] flex-shrink-0" />

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
              🧠 Акинатор · {headerTitle}
            </span>
          </div>

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

        {/* ── Progress bar ──────────────────────────────────── */}
        <div className="max-w-[980px] mx-auto">
          <div className="h-3 bg-brand-subtle rounded-pill overflow-hidden relative">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{
                width: `${reveal ? 100 : questionProgress}%`,
                background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
              }}
              role="progressbar"
              aria-valuenow={Math.round(reveal ? 100 : questionProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогресс Акинатора"
            />
          </div>
          <div className="flex justify-between mt-2 mx-0.5" style={{ fontSize: 12 }}>
            <span className="font-bold text-muted">
              {simulatingLeaf
                ? 'Проба профессии'
                : reveal
                ? 'Диагностика завершена'
                : 'Поиск подходящих профессий'}
            </span>
            <span className="font-bold text-muted">
              {reveal ? '100%' : `${Math.round(questionProgress)}%`}
            </span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl lg:max-w-4xl mx-auto w-full px-4 py-6">
        {isLoading || saving ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            {saving && <p className="text-secondary font-bold">Секунду, сохраняем...</p>}
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-body text-danger font-semibold">{error}</p>
            <Button onClick={retry}>Попробовать снова</Button>
          </div>
        ) : simulatingLeaf ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <SimulationCard
              assessmentId={assessmentId!}
              leaf={simulatingLeaf}
              onAccept={handleSimulationAccept}
              onReject={handleSimulationReject}
              onCancel={handleSimulationCancel}
            />
          </div>
        ) : question ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className={cn(
                'flex-1 transition-opacity duration-300',
                transitioning ? 'opacity-0' : 'opacity-100'
              )}
            >
              <div className="flex items-center justify-between gap-[10px] mb-2">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[26px]">⚡</span>
                  <span className="font-extrabold text-brand tracking-[.02em]" style={{ fontSize: 14 }}>
                    АНАЛИЗ ИНТЕРЕСОВ
                  </span>
                </div>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={saving}
                    className="font-bold text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: 13 }}
                  >
                    ← Назад
                  </button>
                )}
              </div>

              <h2
                className={cn(
                  'font-black text-primary mb-8 leading-snug tracking-[-0.01em]',
                  ageGroup === 'junior' ? 'text-title' : 'text-subtitle'
                )}
                style={{ fontSize: 30 }}
              >
                {question.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                {question.options.map(opt => (
                  <OptionCard
                    key={opt.index}
                    text={opt.text}
                    index={opt.index}
                    selected={selectedIndex === opt.index}
                    ageGroup={ageGroup}
                    onPress={() => handleOptionSelect(opt.index)}
                  />
                ))}

                {/* I don't know button styled as OptionCard but placed separately */}
                <button
                  type="button"
                  onClick={() => handleOptionSelect(null)}
                  className={cn(
                    'w-full flex items-center justify-center gap-[14px] text-center border-2 px-5 py-[18px] transition-all duration-150 md:col-span-2 mt-4',
                    selectedIndex === null
                      ? 'border-brand bg-active-tint'
                      : 'border-dashed border-default bg-surface/50 text-secondary hover:border-[#C4B5FD]'
                  )}
                  style={{ borderRadius: 18 }}
                >
                  <span className="font-bold text-secondary" style={{ fontSize: 16 }}>
                    🤷‍♂️ Затрудняюсь ответить / Не знаю
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : reveal ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <RevealCard
              reveal={reveal}
              onReject={handleReject}
              onRejectAll={handleRejectAll}
              onLikeLeaf={handleLikeLeaf}
              onFeedback={handleFeedback}
              onRetakeTest={handleRetakeTest}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
