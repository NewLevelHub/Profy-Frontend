import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Accent, Reveal, SectionHead } from './primitives';

const FAQ_KEYS = ['1', '2', '3', '4', '5'] as const;

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <Reveal className={cn('faq-item border rounded-[var(--radius)] bg-surface overflow-hidden transition-colors', open ? 'border-brand' : 'border-default')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-[1.3rem] text-left"
      >
        <span className="font-display font-medium text-[0.92rem] tracking-[-0.02em]" style={{ color: 'var(--text-heading)' }}>
          {q}
        </span>
        <span
          className={cn(
            'w-5 h-5 shrink-0 rounded-full flex items-center justify-center transition-transform duration-200',
            open && 'rotate-180',
          )}
          style={{ background: open ? 'var(--pine)' : 'var(--bg-page)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[11px] h-[11px]" style={{ color: open ? 'var(--text-on-brand)' : 'var(--text-heading)' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {/* Высота берётся с самого узла, а не задаётся числом в CSS: ответы
          разной длины, и общий потолок либо резал бы длинные, либо делал
          раскрытие коротких рывком. */}
      <div
        className="faq-a"
        style={{ maxHeight: open ? bodyRef.current?.scrollHeight ?? 400 : 0 }}
      >
        <div ref={bodyRef}>
          <p className="px-6 pb-[1.4rem] text-secondary text-[0.9rem] leading-[1.65]">{a}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function FaqSection() {
  const { t } = useTranslation('landing');
  // Открыт всегда один вопрос: у списка из пяти пунктов гармошка с
  // несколькими раскрытыми сразу перестаёт помещаться в экран.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead center eyebrow={t('faq.eyebrow')} title={<>{t('faq.titlePre')}<Accent>{t('faq.titleAccent')}</Accent></>} />
        </Reveal>
        <div className="max-w-[760px] mx-auto flex flex-col gap-[0.9rem]">
          {FAQ_KEYS.map((k, i) => (
            <FaqItem
              key={k}
              q={t(`faq.q${k}`)}
              a={t(`faq.a${k}`)}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
