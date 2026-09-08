import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Accent, Reveal, SectionHead } from './primitives';

const FACT_ICONS: { icon: ReactNode; stroke: string }[] = [
  { icon: <path d="M4 12h4l3 7 3-14 3 7h3" />, stroke: 'var(--pine)' },
  {
    icon: <><path d="M12 3l7.5 3.5v5c0 4.4-3.1 8.4-7.5 9.5-4.4-1.1-7.5-5.1-7.5-9.5v-5z" /><path d="M9.2 12.2l2 2 3.6-3.9" /></>,
    stroke: 'var(--dawn)',
  },
];

const BLOCK_NUMS = ['01', '02', '03', '04', '05', '06'] as const;

export function ReportSection() {
  const { t } = useTranslation('landing');
  const FACTS = FACT_ICONS.map((f, i) => ({ ...f, title: t(`report.fact${i + 1}Title`), desc: t(`report.fact${i + 1}Desc`) }));
  const BLOCKS = BLOCK_NUMS.map((num, i) => ({ num, title: t(`report.block${i + 1}Title`), desc: t(`report.block${i + 1}Desc`) }));
  return (
    <section id="report" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto grid grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] gap-[clamp(2rem,5vw,4.5rem)] items-start max-[900px]:grid-cols-1">
        <Reveal className="sticky top-28 max-[900px]:static">
          <SectionHead
            className="mb-0"
            eyebrow={t('report.eyebrow')}
            title={<>{t('report.titlePre')}<Accent>{t('report.titleAccent')}</Accent></>}
            sub={t('report.sub')}
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
