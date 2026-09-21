import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import { Mascot } from '@/shared/ui/Mascot';
import { Accent, Reveal, SectionHead } from './primitives';
import { useParallax } from '../hooks';
import { cn } from '@/shared/lib/cn';

const STEP_NUMS = ['01', '02', '03'] as const;

export function HowSection() {
  const { t } = useTranslation('landing');
  const mascotRef = useParallax<HTMLDivElement>(0.15);
  const steps = STEP_NUMS.map((num, i) => ({
    num,
    title: t(`how.step${i + 1}Title`),
    desc: t(`how.step${i + 1}Desc`),
  }));

  return (
    <section id="how" className="relative py-[clamp(4.5rem,8vw,7.5rem)] bg-surface">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal className="relative">
          <div
            ref={mascotRef}
            className="mascot-parallax -top-[1.6rem] right-[2%] w-[clamp(96px,10vw,132px)] max-[900px]:hidden"
            style={{ '--rot': '6deg' } as CSSProperties}
            aria-hidden="true"
          >
            <Mascot state="transition" size="100%" blink={false} className="mascot-deco" />
          </div>
          <SectionHead
            center
            eyebrow={t('how.eyebrow')}
            title={<>{t('how.titlePre')}<Accent>{t('how.titleAccent')}</Accent></>}
            sub={t('how.sub')}
          />
        </Reveal>

        <div className="how-path relative grid grid-cols-3 gap-[1.6rem] max-[1024px]:gap-[1.1rem] max-[680px]:grid-cols-1">
          <div className="how-path__line max-[680px]:hidden" aria-hidden="true" />
          {steps.map((step, i) => (
            <Reveal
              key={step.num}
              delay={i + 1}
              className={cn(
                'how-path__step relative px-[1.6rem] pt-[1.9rem] pb-[2.1rem] bg-surface border border-default rounded-[var(--radius)] transition-colors hover:border-brand hover:bg-hover',
                i === 1 && 'how-path__step--active',
              )}
            >
              <div
                className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center font-display font-semibold text-caption tracking-[-0.02em] mb-[1.3rem]"
                style={{
                  background: i === 1 ? 'var(--pine)' : 'var(--brand-subtle)',
                  border: '1px solid color-mix(in srgb, var(--pine) 22%, transparent)',
                  color: i === 1 ? 'var(--on-brand-solid, var(--paper))' : 'var(--pine)',
                }}
              >
                {step.num}
              </div>
              <h3 className="font-display text-body-sm font-semibold tracking-[-0.02em] mb-[0.65rem]" style={{ color: 'var(--text-heading)' }}>
                {step.title}
              </h3>
              <p className="text-secondary text-body-sm leading-[1.55]">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
