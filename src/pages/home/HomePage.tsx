import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useHome } from './hooks/useHome';
import { BlockRoadmap } from './components/BlockRoadmap';
import { BlockRoadmapQuest } from './components/BlockRoadmapQuest';

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
    roadmapCurrentBlock,
    completedCount,
    nextBlockName,
    handleContinue,
    handleRetakeBlock,
  } = useHome();

  const [roadmapVariant, setRoadmapVariant] = useState<'stepper' | 'quest'>('stepper');

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
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div
          className="w-[62px] h-[62px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 8px 18px rgba(124,58,237,.3)', fontSize: 26, fontWeight: 900, color: '#fff' }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div>
          <h1 className="font-black text-primary leading-tight tracking-[-0.01em]" style={{ fontSize: 30 }}>
            {`Привет, ${displayName}! 👋`}
          </h1>
          <p className="text-secondary font-semibold" style={{ fontSize: 15, marginTop: 3 }}>
            {isCompleted
              ? 'Ты прошёл всю диагностику!'
              : inProgress
              ? 'Продолжим путь к профессии?'
              : 'Готов начать диагностику?'}
          </p>
        </div>
      </div>

      {/* ── Hero progress card ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[24px] p-[28px_32px]"
        style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)', boxShadow: '0 14px 32px rgba(124,58,237,.28)' }}
      >
        <div className="absolute top-[-50px] right-[-30px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative flex items-center gap-6 flex-wrap">
          {/* Progress circle */}
          <div className="w-[84px] h-[84px] flex-none">
            <div
              className="w-[84px] h-[84px] rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(#fff ${Math.round((completedCount / totalBlocks) * 360)}deg, rgba(255,255,255,.25) 0)` }}
            >
              <div
                className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center"
                style={{ background: '#7C3AED', color: '#fff' }}
              >
                <span style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{completedCount}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>/{totalBlocks}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] text-white">
            <h2 className="font-black mb-1" style={{ fontSize: 24 }}>Твой путь</h2>
            <p className="font-semibold" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{heroSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="h-[54px] px-[34px] rounded-pill font-extrabold transition-transform hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap flex-none"
            style={{ background: '#fff', color: '#5B21B6', fontSize: 16, boxShadow: '0 6px 16px rgba(0,0,0,.12)' }}
          >
            {heroBtnLabel} →
          </button>
        </div>
      </div>

      {/* ── Quick access 2-col grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        <button
          type="button"
          onClick={() => navigate('/results')}
          className="bg-surface border border-default rounded-[18px] p-[18px_20px] flex items-center gap-[14px] text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-[#C4B5FD]"
        >
          <div className="w-[46px] h-[46px] rounded-[13px] bg-brand-subtle flex items-center justify-center text-[22px] flex-none">📋</div>
          <div>
            <p className="font-extrabold text-primary" style={{ fontSize: 16 }}>Результаты</p>
            <p className="text-muted font-semibold" style={{ fontSize: 13 }}>Что мы узнали о тебе</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="bg-surface border border-default rounded-[18px] p-[18px_20px] flex items-center gap-[14px] text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-[#C4B5FD]"
        >
          <div className="w-[46px] h-[46px] rounded-[13px] bg-brand-subtle flex items-center justify-center text-[22px] flex-none">👤</div>
          <div>
            <p className="font-extrabold text-primary" style={{ fontSize: 16 }}>Профиль</p>
            <p className="text-muted font-semibold" style={{ fontSize: 13 }}>Твои данные</p>
          </div>
        </button>
      </div>

      {/* ── Block roadmap ───────────────────────────────────────────── */}
      {hasAssessment && (
        <section aria-label="Дорожная карта блоков">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="font-black text-primary" style={{ fontSize: 24 }}>Дорожная карта</h2>
            <div className="flex gap-1 p-1 rounded-pill" style={{ background: '#EDE9FE' }}>
              {(['stepper', 'quest'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRoadmapVariant(v)}
                  className="font-extrabold transition-all rounded-pill px-[18px] py-[7px]"
                  style={roadmapVariant === v
                    ? { background: '#fff', color: '#5B21B6', fontSize: 13, boxShadow: '0 2px 6px rgba(30,27,75,.08)' }
                    : { background: 'transparent', color: '#7C3AED', fontSize: 13 }
                  }
                >
                  {v === 'stepper' ? 'Стэппер' : 'Квест-карта'}
                </button>
              ))}
            </div>
          </div>

          {roadmapVariant === 'stepper' ? (
            <div className="bg-surface border border-default rounded-[22px] shadow-card p-[30px_28px]">
              <BlockRoadmap
                blocks={activeBlocks}
                currentBlock={roadmapCurrentBlock}
                onContinue={handleContinue}
                onRetake={handleRetakeBlock}
              />
            </div>
          ) : (
            <BlockRoadmapQuest
              blocks={activeBlocks}
              currentBlock={roadmapCurrentBlock}
              onContinue={handleContinue}
              onRetake={handleRetakeBlock}
            />
          )}
        </section>
      )}
    </div>
  );
}
