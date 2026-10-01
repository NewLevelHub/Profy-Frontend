import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Counter, Reveal } from './primitives';

/* Полоса цифр инвертирована намеренно: ритм страницы идёт светлая — тёмная —
   светлая, и взгляд получает точку опоры на длинной прокрутке. */
export function StatsSection() {
  const { t } = useTranslation('landing');
  const STATS: { icon: ReactNode; tint: string; value: ReactNode; label: string }[] = [
    {
      icon: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
      tint: 'var(--lake-light)',
      value: <>≈<Counter target={250} /></>,
      label: t('stats.uni'),
    },
    {
      icon: <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
      tint: 'var(--pine-light)',
      value: <>≈<Counter target={2400} /></>,
      label: t('stats.programs'),
    },
    {
      icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
      tint: 'var(--on-brand-solid)',
      value: <Counter target={92} />,
      label: t('stats.professions'),
    },
    {
      icon: <path d="M12 2l2.6 5.5L21 9l-4.5 4.2L17.8 20 12 16.8 6.2 20l1.3-6.8L3 9l6.4-1.5z" />,
      tint: 'var(--dawn-light)',
      value: t('stats.testsValue'),
      label: t('stats.testsLabel'),
    },
  ];

  return (
    <section
      id="stats"
      className="relative -mt-px py-[clamp(3.5rem,6vw,5rem)]"
      style={{ background: 'var(--brand-solid)' }}
    >
      <div className="w-[min(1220px,92%)] mx-auto grid grid-cols-4 gap-8 max-[1024px]:grid-cols-2 max-[1024px]:gap-y-10">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i} className="text-center">
            <div
              className="w-11 h-11 rounded-[var(--radius)] flex items-center justify-center mx-auto mb-[0.9rem] border"
              style={{
                background: 'color-mix(in srgb, var(--on-brand-solid) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--on-brand-solid) 22%, transparent)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5" style={{ color: stat.tint }}>
                {stat.icon}
              </svg>
            </div>
            <div
              className="font-display font-bold text-display-md tracking-[-0.03em]"
              style={{ color: 'var(--on-brand-solid)' }}
            >
              {stat.value}
            </div>
            <div className="text-caption mt-[0.35rem]" style={{ color: 'color-mix(in srgb, var(--on-brand-solid) 62%, transparent)' }}>
              {stat.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
