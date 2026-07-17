import { useNavigate } from 'react-router';
import { playClick } from '@/shared/lib/sounds';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useHome } from './hooks/useHome';
import type { HomeStatus } from './hooks/useHome';

const HEADER_SUBTITLE: Record<HomeStatus, string> = {
  not_started: 'Готов начать диагностику?',
  in_progress: 'Продолжим путь к профессии?',
  completed: 'Ты прошёл всю диагностику!',
};

const HERO_COPY: Record<HomeStatus, { icon: string; title: string; subtitle: string; cta: string }> = {
  not_started: {
    icon: '🚀',
    title: 'Готов начать диагностику?',
    subtitle: 'Пройди тест — и получишь персональную карту профессий',
    cta: 'Начать тест',
  },
  in_progress: {
    icon: '⏳',
    title: 'Тест уже идёт',
    subtitle: 'Продолжим с того места, где остановился',
    cta: 'Продолжить тест',
  },
  completed: {
    icon: '🎉',
    title: 'Результат готов!',
    subtitle: 'Посмотри, что мы о тебе узнали',
    cta: 'Смотреть результат',
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { displayName, initial, status, handleContinue } = useHome();

  const hero = HERO_COPY[status];

  return (
    <PageContainer className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        title={`Привет, ${displayName}! 👋`}
        subtitle={HEADER_SUBTITLE[status]}
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

      {/* ── Hero status card ────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[24px] p-[28px_32px]"
        style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)', boxShadow: '0 14px 32px rgba(124,58,237,.28)' }}
      >
        <div className="absolute top-[-50px] right-[-30px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative flex items-center gap-6 flex-wrap">
          <div
            className="w-[68px] h-[68px] rounded-full flex items-center justify-center flex-none"
            style={{ background: 'rgba(255,255,255,.15)', fontSize: 30 }}
            aria-hidden="true"
          >
            {hero.icon}
          </div>

          <div className="flex-1 min-w-[220px] text-white">
            <h2 className="font-black mb-1" style={{ fontSize: 24 }}>{hero.title}</h2>
            <p className="font-semibold" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{hero.subtitle}</p>
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
            {hero.cta} →
          </button>
        </div>
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
