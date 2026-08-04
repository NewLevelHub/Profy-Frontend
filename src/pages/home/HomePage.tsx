import { useNavigate } from 'react-router';
import { playClick } from '@/shared/lib/sounds';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useHome } from './hooks/useHome';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    displayName,
    initial,
    hasAssessment,
    isCompleted,
    inProgress,
    answeredCount,
    totalQuestions,
    handleContinue,
  } = useHome();

  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const heroSubtitle = isCompleted
    ? 'Ты прошёл весь тест RIASEC! Смотри результат'
    : !hasAssessment
    ? 'Один тест из 146 вопросов — и ты получишь персональную карту профессий'
    : answeredCount === 0
    ? 'Начнём тест RIASEC?'
    : `Отвечено ${answeredCount} из ${totalQuestions} вопросов`;

  const heroBtnLabel = isCompleted
    ? 'Обновить результат'
    : inProgress
    ? 'Продолжить тест'
    : 'Начать тест';

  return (
    <PageContainer className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        title={`Привет, ${displayName}! 👋`}
        subtitle={
          isCompleted
            ? 'Ты прошёл всю диагностику!'
            : inProgress
            ? 'Продолжим путь к профессии?'
            : 'Готов начать диагностику?'
        }
        leading={(
          <div
            className="w-[62px] h-[62px] rounded-full flex items-center justify-center flex-shrink-0 text-[26px] font-black text-on-brand"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 8px 18px rgba(124,58,237,.3)' }}
            aria-hidden="true"
          >
            {initial}
          </div>
        )}
      />

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
              style={{ background: `conic-gradient(#fff ${Math.round(progressPct * 3.6)}deg, rgba(255,255,255,.25) 0)` }}
            >
              <div
                className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center"
                style={{ background: '#7C3AED', color: '#fff' }}
              >
                <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{progressPct}%</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[220px] text-white">
            <h2 className="font-black mb-1" style={{ fontSize: 24 }}>Твой путь</h2>
            <p className="font-semibold" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{heroSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              playClick();
              handleContinue();
            }}
            className="h-[54px] px-[34px] rounded-pill font-extrabold transition-transform hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap flex-none"
            style={{ background: '#fff', color: '#5B21B6', fontSize: 16, boxShadow: '0 6px 16px rgba(0,0,0,.12)' }}
          >
            {heroBtnLabel} →
          </button>
        </div>

        {hasAssessment && !isCompleted && (
          <div className="relative mt-6">
            <div className="h-2.5 rounded-pill overflow-hidden" style={{ background: 'rgba(255,255,255,.25)' }}>
              <div
                className="h-full rounded-pill transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%`, background: '#fff' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Quick access 2-col grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        <button
          type="button"
          onClick={() => {
            playClick();
            navigate('/results');
          }}
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
          onClick={() => {
            playClick();
            navigate('/profile');
          }}
          className="bg-surface border border-default rounded-[18px] p-[18px_20px] flex items-center gap-[14px] text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-[#C4B5FD]"
        >
          <div className="w-[46px] h-[46px] rounded-[13px] bg-brand-subtle flex items-center justify-center text-[22px] flex-none">👤</div>
          <div>
            <p className="font-extrabold text-primary" style={{ fontSize: 16 }}>Профиль</p>
            <p className="text-muted font-semibold" style={{ fontSize: 13 }}>Твои данные</p>
          </div>
        </button>
      </div>
    </PageContainer>
  );
}
