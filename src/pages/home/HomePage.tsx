import { useNavigate } from 'react-router';
import { playClick } from '@/shared/lib/sounds';
import { PageContainer } from '@/shared/ui/PageContainer';
import { SectionHeading } from '@/shared/ui/SectionHeading';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Mascot } from '@/shared/ui/Mascot';
import { SPHERE_MASCOT } from '@/shared/config/sphereMascot';
import { useHome } from './hooks/useHome';
import type { HomeStatus } from './hooks/useHome';

// The design's DashboardScreen mock has no separate "completed" layout — the
// greeting + quick-access cards stay the same regardless of test status,
// only the "continue test" banner drops away once there's nothing to
// continue. The "Ты уже прошёл тестирование" full card belongs to the Test
// section (see GoalSelectionPage's restartOpen state), not here.
const GREETING_SUBTITLE: Record<HomeStatus, string> = {
  not_started: 'Пройди тест — и я подберу направление и покажу, что нужно для поступления.',
  in_progress: 'Тест проходят один раз — закончи его, и я подберу направление и покажу, что нужно для поступления.',
  completed: 'Направление подобрано — загляни в результат, план развития или подборку университетов.',
};

const BANNER_COPY: Partial<Record<HomeStatus, { eyebrow: string; title: string; cta: string }>> = {
  not_started: {
    eyebrow: 'Первый шаг',
    title: 'Пройди тест и узнай своё направление',
    cta: 'Начать тест →',
  },
  in_progress: {
    eyebrow: 'Тест в процессе',
    title: 'Продолжи тест с того места, где остановился',
    cta: 'Продолжить тест →',
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const {
    displayName, status,
    spheresPreview, spheresTotal, spheresLoading,
    handleContinue, goToSpheres, goToSphere,
    directionSlug,
  } = useHome();

  const banner = status === 'completed' ? undefined : BANNER_COPY[status];

  const cards = [
    {
      title: 'Твой результат',
      description: 'Направление, которое подобрал тест, и почему оно тебе подходит.',
      cta: 'Смотреть →',
      to: '/results',
    },
    {
      title: 'План развития',
      description: 'Что подтянуть по предметам и с чего начать уже сейчас.',
      cta: 'Открыть →',
      to: directionSlug ? `/results/directions/${directionSlug}/roadmap` : '/results',
    },
    {
      title: 'Университеты',
      description: 'Программы в Казахстане и за рубежом с требованиями по ЕНТ.',
      cta: 'Найти →',
      to: directionSlug ? `/results/directions/${directionSlug}/universities` : '/results',
    },
  ] as const;

  return (
    <PageContainer className="space-y-7">

      {/* ── Greeting ────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <div
          className="w-[130px] h-[160px] sm:w-[150px] sm:h-[190px] flex-none rounded-[22px] bg-brand-subtle flex items-end justify-center overflow-hidden"
          aria-hidden="true"
        >
          <Mascot kind="pm" className="w-[112px] h-[148px] sm:w-[130px] sm:h-[172px]" />
        </div>

        <div className="relative bg-surface border-2 border-strong rounded-[22px] p-5 sm:p-[22px_26px] flex-1 w-full">
          <div className="absolute left-1/2 -top-[9px] -ml-[7px] w-[14px] h-[14px] bg-surface border-l-2 border-t-2 border-strong rotate-45 sm:hidden" />
          <div className="absolute hidden sm:block -left-[9px] bottom-[34px] w-[14px] h-[14px] bg-surface border-l-2 border-b-2 border-strong rotate-45" />
          <h1 className="font-black text-primary text-2xl sm:text-[26px]">Привет, {displayName}!</h1>
          <p className="text-secondary font-semibold text-[15px] sm:text-[17px] mt-1.5 text-pretty">
            {GREETING_SUBTITLE[status]}
          </p>
        </div>
      </div>

      {/* ── Continue / start banner ─────────────────────────────────── */}
      {banner && (
        <div
          className="rounded-[22px] p-6 sm:p-[26px_28px] text-on-brand flex flex-wrap items-center gap-5 sm:gap-6"
          style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)', boxShadow: '0 14px 32px rgba(124,58,237,.28)' }}
        >
          <div className="flex-1 min-w-[220px]">
            <div className="text-xs font-extrabold tracking-[0.08em] uppercase opacity-85">{banner.eyebrow}</div>
            <div className="text-xl sm:text-[26px] font-extrabold mt-1.5">{banner.title}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClick();
              handleContinue();
            }}
            className="h-[54px] px-[28px] rounded-pill bg-surface font-extrabold text-[16px] transition-transform hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap flex-none"
            style={{ color: 'var(--brand-hover)', boxShadow: '0 6px 16px rgba(0,0,0,.12)' }}
          >
            {banner.cta}
          </button>
        </div>
      )}

      {/* ── Quick access cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {cards.map(card => (
          <button
            key={card.title}
            type="button"
            onClick={() => {
              playClick();
              navigate(card.to);
            }}
            className="text-left bg-surface border-2 border-strong rounded-[22px] p-[22px] flex flex-col gap-2 transition-all hover:-translate-y-0.5 hover:border-brand"
          >
            <div className="font-extrabold text-primary text-lg">{card.title}</div>
            <p className="text-secondary font-semibold text-[15px] text-pretty">{card.description}</p>
            <div className="text-brand font-extrabold text-[15px] mt-auto pt-1">{card.cta}</div>
          </button>
        ))}
      </div>

      {/* ── Спheres of professions ───────────────────────────────────── */}
      {status !== 'completed' && (
        <div>
          <div className="flex items-baseline justify-between mb-4 gap-3">
            <SectionHeading title="Сферы профессий" className="mb-0" />
            <button
              type="button"
              onClick={() => {
                playClick();
                goToSpheres();
              }}
              className="font-extrabold text-brand text-[15px] whitespace-nowrap hover:text-[color:var(--brand-hover)] transition-colors"
            >
              {spheresTotal > 0 ? `Все ${spheresTotal} сфер →` : 'Все сферы →'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {spheresLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[172px] rounded-[20px]" />
                ))
              : spheresPreview.map(sphere => (
                  <button
                    key={sphere.slug}
                    type="button"
                    onClick={() => {
                      playClick();
                      goToSphere(sphere.slug);
                    }}
                    className="bg-surface border-2 border-strong rounded-[20px] overflow-hidden flex flex-col transition-colors hover:border-brand"
                  >
                    <div className="h-[110px] w-full bg-brand-subtle flex items-end justify-center" aria-hidden="true">
                      <Mascot kind={SPHERE_MASCOT[sphere.slug] ?? 'pm'} className="w-[78px] h-[104px]" />
                    </div>
                    <div className="px-3 py-3 text-center">
                      <p className="font-extrabold text-primary text-[15px]">{sphere.name}</p>
                    </div>
                  </button>
                ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
