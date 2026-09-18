import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { Accent, Reveal, SectionHead } from './primitives';
import { useParallax } from '../hooks';

/* Каждая карточка несёт свой цвет из палитры — иконка и её плашка совпадают,
   поэтому сетка читается как шесть разных вещей, а не шесть одинаковых. */
const FEATURE_META: { icon: ReactNode; stroke: string; card: string; plate: string; ring: string }[] = [
  {
    icon: <><path d="M4 7h9M19 7h1M4 17h5M15 17h5" /><circle cx="16" cy="7" r="2.2" /><circle cx="12" cy="17" r="2.2" /></>,
    stroke: 'var(--lake)',
    card: 'color-mix(in srgb, var(--lake) 5.5%, transparent)',
    plate: 'color-mix(in srgb, var(--lake) 12%, transparent)',
    ring: 'color-mix(in srgb, var(--lake) 30%, transparent)',
  },
  {
    icon: <><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>,
    stroke: 'var(--pine)',
    card: 'color-mix(in srgb, var(--pine) 5%, transparent)',
    plate: 'color-mix(in srgb, var(--pine) 10%, transparent)',
    ring: 'color-mix(in srgb, var(--pine) 28%, transparent)',
  },
  {
    icon: <><path d="M20 15a3 3 0 01-3 3H8l-4 3V6a3 3 0 013-3h10a3 3 0 013 3z" /><path d="M8.5 9.5h7M8.5 13h4" /></>,
    stroke: 'var(--pine-light)',
    card: 'color-mix(in srgb, var(--pine-light) 7%, transparent)',
    plate: 'color-mix(in srgb, var(--pine-light) 16%, transparent)',
    ring: 'color-mix(in srgb, var(--pine-light) 40%, transparent)',
  },
  {
    icon: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
    stroke: 'var(--lake-light)',
    card: 'color-mix(in srgb, var(--lake-light) 7%, transparent)',
    plate: 'color-mix(in srgb, var(--lake-light) 16%, transparent)',
    ring: 'color-mix(in srgb, var(--lake-light) 40%, transparent)',
  },
  {
    icon: <><path d="M5 20v-8M12 20V4M19 20v-6" /><path d="M3 20h18" /></>,
    stroke: 'var(--dawn)',
    card: 'color-mix(in srgb, var(--dawn) 6%, transparent)',
    plate: 'color-mix(in srgb, var(--dawn) 14%, transparent)',
    ring: 'color-mix(in srgb, var(--dawn) 34%, transparent)',
  },
  {
    icon: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
    stroke: 'var(--pine)',
    card: 'color-mix(in srgb, var(--pine) 5%, transparent)',
    plate: 'color-mix(in srgb, var(--pine) 10%, transparent)',
    ring: 'color-mix(in srgb, var(--pine) 28%, transparent)',
  },
];

export function FeaturesSection() {
  const { t } = useTranslation('landing');
  const mascotRef = useParallax<HTMLDivElement>(0.15);
  const FEATURES = FEATURE_META.map((m, i) => ({
    ...m,
    title: t(`features.f${i + 1}Title`),
    desc: t(`features.f${i + 1}Desc`),
  }));

  return (
    <section id="features" className="section-gradient relative py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal className="relative">
          <div
            ref={mascotRef}
            className="mascot-parallax -top-[1.4rem] right-[4%] w-[clamp(96px,10vw,128px)] max-[900px]:hidden"
            style={{ '--rot': '-5deg' } as React.CSSProperties}
            aria-hidden="true"
          >
            <Mascot state="rest" size="100%" blink={false} className="mascot-deco" />
          </div>
          <SectionHead
            center
            eyebrow={t('features.eyebrow')}
            title={<>{t('features.titlePre')}<Accent>{t('features.titleAccent')}</Accent></>}
            sub={t('features.sub')}
          />
        </Reveal>

        <div className="relative z-[1] grid grid-cols-3 gap-6 max-[1024px]:grid-cols-2 max-[680px]:grid-cols-1">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i + 1}
              className="relative overflow-hidden px-[1.7rem] py-8 rounded-[var(--radius)] border border-default transition-colors hover:border-brand"
            >
              <div style={{ background: feature.card, position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true" />
              <div className="relative">
                <div
                  className="w-[52px] h-[52px] rounded-[var(--radius)] flex items-center justify-center mb-[1.4rem] border"
                  style={{ background: feature.plate, borderColor: feature.ring }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={feature.stroke} strokeWidth="1.8" className="w-6 h-6">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-display text-body-md font-semibold tracking-[-0.02em] mb-[0.7rem]" style={{ color: 'var(--text-heading)' }}>
                  {feature.title}
                </h3>
                <p className="text-secondary text-body-sm leading-[1.6]">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
