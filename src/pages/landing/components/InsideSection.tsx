import type { ReactNode } from 'react';
import { Accent, Reveal, SectionHead } from './primitives';

/* Крупная цветная плашка вместо точки — блок читается как «свой» цвет ещё
   до того, как прочитан заголовок. Цвет группы прокидывается через --gc. */
const GROUPS: { color: string; icon: ReactNode; name: string; desc: string; chips: string[] }[] = [
  {
    color: 'var(--pine)',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5 11 11 8.5 15.5 13 13z" /></>,
    name: 'Тест интересов',
    desc: 'К какому типу дела больше тянет. 146 утверждений по шкале согласия — от «совсем не моё» до «точно моё».',
    chips: ['Практика', 'Исследования', 'Творчество', 'Люди', 'Лидерство', 'Порядок'],
  },
  {
    color: 'var(--pine-light)',
    icon: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0115 0" /></>,
    name: 'Тест личности',
    desc: 'Как ты реагируешь на стресс, насколько общителен, открыт новому, доброжелателен и организован. 120 утверждений, та же шкала.',
    chips: ['Стресс', 'Общительность', 'Открытость новому', 'Доброжелательность', 'Организованность'],
  },
  {
    color: 'var(--dawn)',
    icon: <><path d="M12 21a5.2 5.2 0 005.2-5.2c0-4.2-5.2-8.8-5.2-8.8S6.8 11.6 6.8 15.8A5.2 5.2 0 0012 21z" /><path d="M12 21a2.2 2.2 0 002.2-2.2c0-1.8-2.2-3.7-2.2-3.7s-2.2 1.9-2.2 3.7A2.2 2.2 0 0012 21z" /></>,
    name: 'Тест мотивации',
    desc: 'Что для тебя по-настоящему важно в работе. 12 раундов по три утверждения: отмечаешь, что больше похоже на тебя, а что меньше.',
    chips: ['Интерес к делу', 'Вызов и рост', 'Помощь людям', 'Свобода', 'Доход', 'Стабильность'],
  },
];

export function InsideSection() {
  return (
    <section id="inside" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead
            center
            eyebrow="Что внутри"
            title={<>Три теста — <Accent>и полный портрет</Accent></>}
            sub="Все блоки связаны в один сценарий, а не в набор разрозненных анкет."
          />
        </Reveal>

        <div className="grid grid-cols-3 gap-[1.3rem] max-[1024px]:gap-4 max-[680px]:grid-cols-1">
          {GROUPS.map((group, i) => (
            <Reveal
              key={group.name}
              delay={i + 1}
              className="px-[1.4rem] py-[1.7rem] rounded-[var(--radius)] border transition-colors"
              // color-mix от цвета группы: одна переменная задаёт и заливку,
              // и рамку, и цвет заголовка — оттенки не расходятся вручную.
              style={{
                background: `color-mix(in srgb, ${group.color} 14%, var(--bg-surface))`,
                borderColor: `color-mix(in srgb, ${group.color} 28%, var(--bg-surface))`,
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[var(--radius)] mb-4 flex items-center justify-center"
                style={{ background: group.color }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="1.9" className="w-5 h-5">
                  {group.icon}
                </svg>
              </div>
              <h4
                className="font-display text-[0.94rem] font-semibold tracking-[-0.02em] mb-2"
                style={{ color: `color-mix(in srgb, ${group.color} 72%, var(--midnight))` }}
              >
                {group.name}
              </h4>
              <p className="text-secondary text-[0.82rem] leading-[1.5] mb-[1.1rem]">{group.desc}</p>
              <div className="flex flex-wrap gap-[0.45rem]">
                {group.chips.map(chip => (
                  <span
                    key={chip}
                    className="text-[0.72rem] font-semibold px-[0.7rem] py-[0.35rem] rounded-pill border bg-surface"
                    style={{
                      borderColor: `color-mix(in srgb, ${group.color} 34%, var(--bg-surface))`,
                      color: `color-mix(in srgb, ${group.color} 78%, var(--midnight))`,
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
