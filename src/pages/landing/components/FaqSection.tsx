import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Accent, Reveal, SectionHead } from './primitives';

const ITEMS = [
  {
    q: 'Сколько длится диагностика и можно ли прерваться?',
    a: 'Диагностика занимает около 15 минут. Три теста рассчитаны на одно прохождение, но прогресс сохраняется автоматически: можно закрыть на любом вопросе и вернуться позже — продолжишь с того же места. На 25%, 50% и 75% специально сделаны привалы, чтобы передохнуть.',
  },
  {
    q: 'Насколько можно доверять результату?',
    a: 'В основе — классические методики профориентации: тест интересов по типам деятельности, тест личности по ключевым чертам характера и тест мотивации через сравнение ценностей. Подсчёт однозначный, без всякой случайности. При этом результат — опора для решения, а не приговор.',
  },
  {
    q: 'Какие университеты есть в каталоге?',
    a: '2 440 университета: 128 казахстанских и 2 312 зарубежных. Внутри — 12 463 программы и специальности, и все они разложены по 145 профессиям. У каждой программы показан город, а сортировка идёт по международным и региональным рейтингам вузов.',
  },
  {
    q: 'А если я пока ничем особо не увлекаюсь?',
    a: 'Так бывает часто — в этом возрасте интересы у многих ещё не оформились. Поэтому до тестов можно коротко рассказать о себе в свободной форме: если по тесту интересов ничего не выражено ярко, система опирается прежде всего на этот рассказ.',
  },
  {
    q: 'Текст отчёта пишет искусственный интеллект?',
    a: 'Да, но только из подтверждённых фактов о тебе: результатов тестов и твоего рассказа о себе. ИИ ничего не придумывает от себя — он только переводит результаты на человеческий язык: связывает три теста и твой рассказ в один текст и объясняет, почему тебе подошла именно эта профессия.',
  },
];

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
        <span className="font-display font-medium text-[0.92rem] tracking-[-0.02em]" style={{ color: 'var(--midnight)' }}>
          {q}
        </span>
        <span
          className={cn(
            'w-5 h-5 shrink-0 rounded-full flex items-center justify-center transition-transform duration-200',
            open && 'rotate-180',
          )}
          style={{ background: open ? 'var(--pine)' : 'var(--bg-page)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[11px] h-[11px]" style={{ color: open ? 'var(--paper)' : 'var(--midnight)' }}>
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
  // Открыт всегда один вопрос: у списка из пяти пунктов гармошка с
  // несколькими раскрытыми сразу перестаёт помещаться в экран.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead center eyebrow="Вопросы" title={<>Отвечаем на <Accent>частые вопросы</Accent></>} />
        </Reveal>
        <div className="max-w-[760px] mx-auto flex flex-col gap-[0.9rem]">
          {ITEMS.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
