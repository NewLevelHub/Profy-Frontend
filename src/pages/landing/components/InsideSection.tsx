import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Accent, Reveal, SectionHead } from './primitives';

/* Крупная цветная плашка вместо точки — блок читается как «свой» цвет ещё
   до того, как прочитан заголовок. Порядок — как в самом прохождении:
   интересы → мотивация → команда → способности. Теста личности (Big Five)
   здесь нет: новым ученикам он больше не задаётся.

   tint — доля цвета в заливке карточки. Тёмный --pine при общих 14% давал
   серо-болотную плашку рядом со светлыми соседями, ему нужно меньше. */
const GROUP_META: { key: string; color: string; tint: number; icon: ReactNode; chipCount: number }[] = [
  {
    key: 'interests',
    color: 'var(--pine)',
    tint: 9,
    icon: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5 11 11 8.5 15.5 13 13z" /></>,
    chipCount: 6,
  },
  {
    key: 'motivation',
    color: 'var(--dawn)',
    tint: 14,
    icon: <><path d="M12 21a5.2 5.2 0 005.2-5.2c0-4.2-5.2-8.8-5.2-8.8S6.8 11.6 6.8 15.8A5.2 5.2 0 0012 21z" /><path d="M12 21a2.2 2.2 0 002.2-2.2c0-1.8-2.2-3.7-2.2-3.7s-2.2 1.9-2.2 3.7A2.2 2.2 0 0012 21z" /></>,
    chipCount: 6,
  },
  {
    key: 'team',
    color: 'var(--pine-light)',
    tint: 14,
    icon: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="9" r="2.6" /><path d="M16 14.1a5 5 0 015 5.9" /></>,
    chipCount: 6,
  },
  {
    key: 'abilities',
    color: 'var(--lake)',
    tint: 14,
    icon: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" /></>,
    chipCount: 6,
  },
];

export function InsideSection() {
  const { t } = useTranslation('landing');
  const GROUPS = GROUP_META.map(g => ({
    ...g,
    name: t(`inside.${g.key}Name`),
    desc: t(`inside.${g.key}Desc`),
    chips: Array.from({ length: g.chipCount }, (_, i) => t(`inside.${g.key}Chip${i + 1}`)),
  }));
  return (
    <section id="inside" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead
            center
            eyebrow={t('inside.eyebrow')}
            title={<>{t('inside.titlePre')}<Accent>{t('inside.titleAccent')}</Accent></>}
            sub={t('inside.sub')}
          />
        </Reveal>

        <div className="grid grid-cols-4 gap-[1.3rem] max-[1100px]:grid-cols-2 max-[1024px]:gap-4 max-[680px]:grid-cols-1">
          {GROUPS.map((group, i) => (
            <Reveal
              key={group.name}
              delay={i + 1}
              className="px-[1.4rem] py-[1.7rem] rounded-[var(--radius)] border transition-colors"
              // color-mix от цвета группы: одна переменная задаёт и заливку,
              // и рамку, и цвет заголовка — оттенки не расходятся вручную.
              style={{
                background: `color-mix(in srgb, ${group.color} ${group.tint}%, var(--bg-surface))`,
                borderColor: `color-mix(in srgb, ${group.color} 28%, var(--bg-surface))`,
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[var(--radius)] mb-4 flex items-center justify-center"
                style={{ background: group.color }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-on-brand)" strokeWidth="1.9" className="w-5 h-5">
                  {group.icon}
                </svg>
              </div>
              <h4
                className="font-display text-body-sm font-semibold tracking-[-0.02em] mb-2"
                style={{ color: `color-mix(in srgb, ${group.color} 72%, var(--text-heading))` }}
              >
                {group.name}
              </h4>
              <p className="text-secondary text-caption leading-[1.5] mb-[1.1rem]">{group.desc}</p>
              <div className="flex flex-wrap gap-[0.45rem]">
                {group.chips.map(chip => (
                  <span
                    key={chip}
                    className="text-mono-xs font-semibold px-[0.7rem] py-[0.35rem] rounded-pill border bg-surface"
                    style={{
                      borderColor: `color-mix(in srgb, ${group.color} 34%, var(--bg-surface))`,
                      color: `color-mix(in srgb, ${group.color} 78%, var(--text-heading))`,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
