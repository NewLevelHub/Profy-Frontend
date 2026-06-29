import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { useHome } from './hooks/useHome';
import { BlockRoadmap } from './components/BlockRoadmap';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    displayName,
    initial,
    activeBlocks,
    totalBlocks,
    hasAssessment,
    isCompleted,
    inProgress,
    currentBlock,
    completedCount,
    nextBlockName,
    handleContinue,
    handleRetakeBlock,
  } = useHome();

  const heroSubtitle = isCompleted
    ? 'Ты прошёл все блоки! Смотри результат'
    : !hasAssessment
    ? `${totalBlocks} коротких блоков — и ты получишь персональную карту профессий`
    : completedCount === 0
    ? `Начнём с блока «${nextBlockName}»`
    : `Пройден ${completedCount} блок из ${totalBlocks}${nextBlockName ? `. Дальше — «${nextBlockName}»` : ''}`;

  const heroBtnLabel = isCompleted
    ? 'Обновить результат'
    : inProgress
    ? 'Продолжить тест'
    : 'Начать тест';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div
          className="w-13 h-13 rounded-full bg-brand flex items-center justify-center shadow-button flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-title font-black text-on-brand">{initial}</span>
        </div>
        <div>
          <h1 className="text-h1 font-black text-primary leading-tight">
            {`Привет, ${displayName}!`}
          </h1>
          <p className="text-body text-secondary">
            {isCompleted
              ? 'Ты прошёл всю диагностику!'
              : inProgress
              ? 'Продолжим путь к профессии?'
              : 'Готов начать диагностику?'}
          </p>
        </div>
      </div>

      {/* ── Hero progress card ───────────────────────────────────── */}
      <div className="bg-brand rounded-[var(--radius-lg)] p-6 shadow-button">
        <div className="flex items-center gap-4 mb-5">
          {/* Progress ring */}
          <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.30)', backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <span className="font-black text-on-brand" style={{ fontSize: 22, lineHeight: 1 }}>
              {completedCount}
            </span>
            <span className="text-on-brand/70 text-caption self-end mb-0.5">
              /{totalBlocks}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-black text-title text-on-brand mb-1">Твой путь</p>
            <p className="text-caption text-on-brand/80 leading-snug">{heroSubtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-pill py-2.5 font-extrabold text-label transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: '#ffffff', color: 'var(--brand)' }}
        >
          {heroBtnLabel}
        </button>
      </div>

      {/* ── Quick access cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="bg-surface border border-default rounded-[var(--radius)] p-4 text-left shadow-card hover:bg-raised transition-colors"
        >
          <span className="text-2xl mb-2 block" aria-hidden="true">📋</span>
          <p className="font-extrabold text-label text-primary mb-0.5">Результаты</p>
          <p className="text-caption text-secondary">Что мы узнали о тебе</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="bg-surface border border-default rounded-[var(--radius)] p-4 text-left shadow-card hover:bg-raised transition-colors"
        >
          <span className="text-2xl mb-2 block" aria-hidden="true">📘</span>
          <p className="font-extrabold text-label text-primary mb-0.5">Роадмап</p>
          <p className="text-caption text-secondary">Твой план развития</p>
        </button>
      </div>

      {/* ── Block roadmap section ────────────────────────────────── */}
      {hasAssessment && (
        <section aria-label="Дорожная карта блоков">
          <h2 className="text-title font-black text-primary mb-4">Дорожная карта</h2>

          <div className="bg-surface border border-default rounded-[var(--radius)] shadow-card p-4">
            <BlockRoadmap
              blocks={activeBlocks}
              currentBlock={currentBlock}
              onContinue={handleContinue}
              onRetake={handleRetakeBlock}
            />
          </div>

          {/* Completion / locked banner */}
          {isCompleted ? (
            <div
              className={cn(
                'mt-3 flex items-center gap-3',
                'bg-success-subtle border rounded-[var(--radius)] px-4 py-3',
              )}
              style={{ borderColor: 'var(--success)' }}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">🎉</span>
              <div>
                <p className="font-extrabold text-label text-success">Поздравляю!</p>
                <p className="text-caption text-success mt-0.5 opacity-80">
                  Ты прошёл все блоки диагностики
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3 bg-accent-soft rounded-[var(--radius)] px-4 py-3">
              <div
                className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(234,88,12,0.15)' }}
              >
                <span className="text-base" aria-hidden="true">🔒</span>
              </div>
              <div>
                <p className="font-extrabold text-label text-accent">Твой план профессий</p>
                <p className="text-caption text-accent mt-0.5 opacity-70">
                  Откроется, когда пройдёшь все блоки
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
