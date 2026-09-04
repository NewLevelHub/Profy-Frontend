import type { ReactNode } from 'react';
import { Accent, Reveal, SectionHead } from './primitives';

const FACTS: { icon: ReactNode; stroke: string; title: string; desc: string }[] = [
  {
    icon: <path d="M4 12h4l3 7 3-14 3 7h3" />,
    stroke: 'var(--pine)',
    title: 'Никаких сухих цифр',
    desc: 'Баллы и проценты остаются внутри системы. Ученик видит понятный текст и наглядные карточки.',
  },
  {
    icon: <><path d="M12 3l7.5 3.5v5c0 4.4-3.1 8.4-7.5 9.5-4.4-1.1-7.5-5.1-7.5-9.5v-5z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></>,
    stroke: 'var(--dawn)',
    title: 'Ничего не выдумано',
    desc: 'Отчёт собирается только из подтверждённых фактов: результатов тестов и твоего рассказа о себе.',
  },
];

const BLOCKS = [
  { num: '01', title: 'Краткое резюме', desc: 'Кто ты в паре абзацев: за что цепляешься, что даётся легко.' },
  { num: '02', title: 'Карта интересов', desc: 'К каким типам дела тянет сильнее, а к каким — заметно меньше.' },
  { num: '03', title: 'Сильные стороны', desc: 'Что у тебя уже получается — по-человечески, а не ярлыками.' },
  { num: '04', title: 'Особенности личности', desc: 'Простым языком: как ты реагируешь на стресс, насколько открыт новому и организован.' },
  { num: '05', title: 'Стиль мышления и мотивация', desc: 'Как ты думаешь — креативно, системно, стратегически или практически — и что тебя по-настоящему двигает.' },
  { num: '06', title: 'Подобранные профессии', desc: 'С объяснением «почему подходит», нужными навыками и школьными предметами — и с университетами и программами под каждую.' },
];

export function ReportSection() {
  return (
    <section id="report" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto grid grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] gap-[clamp(2rem,5vw,4.5rem)] items-start max-[900px]:grid-cols-1">
        <Reveal className="sticky top-28 max-[900px]:static">
          <SectionHead
            className="mb-0"
            eyebrow="Результат"
            title={<>Что будет <Accent>в твоём отчёте</Accent></>}
            sub="Шесть смысловых блоков понятным текстом — без сухих цифр, психологических баллов и терминов, которые нужно гуглить."
          />
          <div className="flex flex-col gap-[0.9rem] mt-[2.2rem]">
            {FACTS.map(fact => (
              <div key={fact.title} className="flex gap-[0.85rem] items-start px-[1.2rem] py-[1.1rem] rounded-[var(--radius)] bg-surface border border-default">
                <svg viewBox="0 0 24 24" fill="none" stroke={fact.stroke} strokeWidth="1.8" className="w-[18px] h-[18px] shrink-0 mt-[0.2rem]">
                  {fact.icon}
                </svg>
                <div>
                  <strong className="block text-[0.92rem] font-semibold mb-[0.15rem]" style={{ color: 'var(--midnight)' }}>
                    {fact.title}
                  </strong>
                  <span className="text-[0.86rem] leading-[1.55] text-secondary">{fact.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Нумерованная линия: кружок с номером и вертикальная связь между
            блоками — псевдоэлементом, чтобы линия обрывалась на последнем. */}
        <Reveal delay={1} className="relative pl-12">
          {BLOCKS.map(block => (
            <div key={block.num} className="report-item relative pb-[1.7rem] last-of-type:pb-0">
              <span
                className="absolute -left-12 -top-[0.15rem] w-8 h-8 rounded-full flex items-center justify-center font-mono text-[0.7rem] font-medium tracking-[0.02em] bg-surface border border-default"
                style={{ color: 'var(--pine)' }}
              >
                {block.num}
              </span>
              <h4 className="font-display font-semibold text-[0.95rem] tracking-[-0.02em] mb-1" style={{ color: 'var(--midnight)' }}>
                {block.title}
              </h4>
              <p className="text-[0.93rem] leading-[1.6] text-secondary">{block.desc}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
