import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { Reveal, SectionHead, Accent } from './primitives';
import { cn } from '@/shared/lib/cn';

const FRAMES = ['results', 'universities', 'plan'] as const;
type Frame = (typeof FRAMES)[number];

/**
 * Lightweight CSS demo loop — product-in-action without video: cycles
 * Results → Universities → Plan mock panels (Jinaq “see it in action” pattern).
 */
export function DemoSection() {
  const { t } = useTranslation('landing');
  const [frame, setFrame] = useState<Frame>('results');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const id = window.setInterval(() => {
      setFrame((prev) => {
        const i = FRAMES.indexOf(prev);
        return FRAMES[(i + 1) % FRAMES.length]!;
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="demo" className="relative py-[clamp(4rem,7vw,6.5rem)] bg-page">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead
            center
            eyebrow={t('demo.eyebrow')}
            title={
              <>
                {t('demo.titlePre')}
                <Accent>{t('demo.titleAccent')}</Accent>
              </>
            }
            sub={t('demo.sub')}
          />
        </Reveal>

        <Reveal delay={1} className="mt-10">
          <div className="landing-demo-shell mx-auto max-w-[720px]">
            <div className="landing-demo-chrome" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-demo-stage">
              {FRAMES.map((id) => (
                <div
                  key={id}
                  className={cn(
                    'landing-demo-frame',
                    frame === id ? 'landing-demo-frame--active' : 'landing-demo-frame--idle',
                  )}
                  aria-hidden={frame !== id}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted m-0 mb-1">
                        {t(`demo.frame.${id}.kicker`)}
                      </p>
                      <p
                        className="font-display text-[1.05rem] font-semibold m-0"
                        style={{ color: 'var(--text-heading)' }}
                      >
                        {t(`demo.frame.${id}.title`)}
                      </p>
                    </div>
                    <Mascot
                      state={id === 'results' ? 'completion' : id === 'universities' ? 'graduate' : 'welcome'}
                      size={56}
                      blink={false}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2].map((n) => (
                      <div key={n} className="landing-demo-row">
                        <span className="landing-demo-bar" style={{ width: `${72 - n * 14}%` }} />
                        <span className="landing-demo-pill" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="landing-demo-dots" role="tablist" aria-label={t('demo.dotsAria')}>
              {FRAMES.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={frame === id}
                  className={cn('landing-demo-dot', frame === id && 'landing-demo-dot--on')}
                  onClick={() => setFrame(id)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
