import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { BLOCK_NAMES, BLOCK_EMOJIS, BLOCK_DESCRIPTIONS } from '@/shared/config/constants';
import { useAssessment } from './hooks/useAssessment';
import { OptionCard } from './components/OptionCard';
import { useAssessmentStore } from '@/shared/store/assessment';
import { AkinatorAssessmentView } from './components/AkinatorAssessmentView';

export default function AssessmentPage() {
  const isAkinator = useAssessmentStore(s => s.isAkinator);

  if (isAkinator) {
    return <AkinatorAssessmentView />;
  }

  return <LegacyAssessmentView />;
}

function LegacyAssessmentView() {
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
    handleStartBlock,
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
      <header
        className="sticky top-0 z-10 px-7 pt-[18px] pb-4"
        style={{ background: 'rgba(245,243,255,0.9)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between max-w-[980px] mx-auto mb-[14px]">
          {phase === 'question' && questionIndex > 0 ? (
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

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-primary" style={{ fontSize: 15 }}>
              {blockName} · {headerTitle.match(/\d+ \/ \d+/)?.[0] ?? `${questionIndex + 1}`}
            </span>
            {/* Возможное внедрение в будущем: бейдж с XP за каждый вопрос в хедере */}
            {/* <span
              className="inline-flex items-center gap-[6px] font-extrabold text-accent-text rounded-pill px-[11px] py-[5px]"
              style={{ background: 'var(--accent-soft)', border: '1px solid #FED7AA', fontSize: 13 }}
            >
              ⚡ {ageGroup === 'junior' ? 60 : ageGroup === 'middle' ? 90 : 120} XP
            </span> */}
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

        {/* ── Progress bars ──────────────────────────────────── */}
        <div className="max-w-[980px] mx-auto">
          <div className="h-3 bg-brand-subtle rounded-pill overflow-hidden relative">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{ width: `${questionProgress}%`, background: 'linear-gradient(90deg,#7C3AED,#A855F7)' }}
              role="progressbar"
              aria-valuenow={Math.round(questionProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогресс вопросов"
            />
          </div>
          <div className="flex justify-between mt-2 mx-0.5" style={{ fontSize: 12 }}>
            <span className="font-bold text-muted">
              {isRetakeMode ? 'Перепрохождение блока' : `Блок ${currentBlock + 1} из ${totalBlocks} · ${blockName}`}
            </span>
            <span className="font-bold text-muted">{Math.round(questionProgress)}%</span>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl lg:max-w-4xl mx-auto w-full">

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* Block intro splash */}
        {phase === 'intro' && (
          <>
            <div
              key={`intro-${currentBlock}`}
              className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-[130px] lg:pb-8"
              style={{ animation: 'fade-in-up 0.5s ease both' }}
            >
              <span className="inline-block mb-[18px]" role="img" aria-hidden style={{ fontSize: 74, animation: 'pf-float 3s ease-in-out infinite' }}>{blockEmoji}</span>
              <span className="inline-block bg-brand-subtle text-brand font-extrabold px-[18px] py-[7px] rounded-pill mb-[22px]" style={{ fontSize: 14 }}>
                Блок {currentBlock + 1} из {totalBlocks}
              </span>
              <h2 className="font-black text-primary mb-[14px] tracking-[-0.02em]" style={{ fontSize: 48 }}>{blockName}</h2>
              <p className="font-semibold leading-relaxed mb-[30px]" style={{ fontSize: 19, color: '#6B7280' }}>{blockDesc}</p>

              <div className="flex items-center justify-center gap-[18px] font-bold" style={{ fontSize: 14, color: '#9CA3AF' }}>
                <span className="inline-flex items-center gap-[6px]">📝 ~{questions.length} вопросов</span>
                <span className="w-[4px] h-[4px] rounded-full" style={{ background: '#C4B5FD' }} />
                <span className="inline-flex items-center gap-[6px]">⏱ {Math.max(1, Math.ceil(questions.length / 4))} мин</span>
                {/* Будущая реализация: XP за блок
                <span className="w-[4px] h-[4px] rounded-full" style={{ background: '#C4B5FD' }} />
                <span className="inline-flex items-center gap-[6px]" style={{ color: '#C2410C' }}>⚡ +{ageGroup === 'junior' ? 60 : ageGroup === 'middle' ? 90 : 120} XP</span>
                */}
              </div>
            </div>

            <div className="fixed left-0 right-0 bottom-0 px-6 pb-[22px] pt-[18px] flex justify-center lg:static lg:px-8 lg:pb-8">
              <Button
                onClick={handleStartBlock}
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
                Начать блок
              </Button>
            </div>
          </>
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
                  <div className="flex items-center gap-[10px] mb-2">
                    <span className="text-[26px]">🌟</span>
                    <span className="font-extrabold text-brand tracking-[.02em]" style={{ fontSize: 14 }}>СЦЕНАРИЙ</span>
                  </div>
                  <h2
                    className={cn(
                      'font-black text-primary mb-8 leading-snug tracking-[-0.01em]',
                      ageGroup === 'junior' ? 'text-title' : 'text-subtitle',
                    )}
                    style={{ fontSize: 30 }}
                  >
                    {currentQuestion.text}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
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
              <div className="px-6 pt-3 pb-8 lg:pb-6 flex justify-center" style={{ background: 'linear-gradient(to top, var(--bg-page) 60%, transparent)' }}>
                <Button
                  onClick={handleNextBlock}
                  isLoading={saving}
                  disabled={saving}
                  size="lg"
                  className="w-full max-w-[560px] lg:max-w-md rounded-pill"
                  style={{ height: 60, fontSize: 18, fontWeight: 800, boxShadow: '0 10px 22px rgba(124,58,237,.32)' }}
                >
                  Дальше →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
