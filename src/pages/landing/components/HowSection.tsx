import { Mascot } from '@/shared/ui/Mascot';
import { Accent, Reveal, SectionHead } from './primitives';
import { useParallax } from '../hooks';

const STEPS = [
  {
    num: '01',
    title: 'Расскажи о себе',
    desc: 'Увлечения, кружки, достижения, любимые темы — коротко и в свободной форме. Это не тест и на результат не влияет: рассказ помогает точнее объяснить, почему подошла та или иная профессия.',
  },
  {
    num: '02',
    title: 'Пройди диагностику',
    desc: 'Три теста подряд: интересы, личность и мотивация. Экраны разные — шкала согласия, расстановка приоритетов, выбор из двух карточек. На 25%, 50% и 75% ждёт привал: короткая пауза, чтобы передохнуть.',
  },
  {
    num: '03',
    title: 'Получи отчёт',
    desc: 'Резюме о себе, карта интересов, сильные стороны, особенности личности, стиль мышления и мотивация — простым языком, без сухих баллов.',
  },
];

export function HowSection() {
  const mascotRef = useParallax<HTMLDivElement>(0.15);

  return (
    <section id="how" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal className="relative">
          <div
            ref={mascotRef}
            className="mascot-parallax -top-[1.6rem] right-[2%] w-[clamp(96px,10vw,132px)] max-[900px]:hidden"
            style={{ '--rot': '6deg' } as React.CSSProperties}
            aria-hidden="true"
          >
            <Mascot state="transition" size="100%" blink={false} className="mascot-deco" />
          </div>
          <SectionHead
            center
            eyebrow="Как это работает"
            title={<>От сомнений до чёткого плана — <Accent>за 3 шага</Accent></>}
            sub="Одно прохождение — и на выходе понятный портрет себя, подходящие профессии и программы вузов под них"
          />
        </Reveal>

        <div className="grid grid-cols-3 gap-[1.6rem] max-[1024px]:gap-[1.1rem] max-[680px]:grid-cols-1">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.num}
              delay={i + 1}
              className="relative px-[1.6rem] pt-[1.9rem] pb-[2.1rem] bg-surface border border-default rounded-[var(--radius)] transition-colors hover:border-brand hover:bg-hover"
            >
              <div
                className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center font-display font-semibold text-[0.85rem] tracking-[-0.02em] mb-[1.3rem]"
                style={{
                  background: 'var(--brand-subtle)',
                  border: '1px solid color-mix(in srgb, var(--pine) 22%, transparent)',
                  color: 'var(--pine)',
                }}
              >
                {step.num}
              </div>
              <h3 className="font-display text-[0.98rem] font-semibold tracking-[-0.02em] mb-[0.65rem]" style={{ color: 'var(--midnight)' }}>
                {step.title}
              </h3>
              <p className="text-secondary text-[0.9rem] leading-[1.55]">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
