import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { ArrowIcon, CtaLink, Reveal, TrustRow } from './primitives';
import { useParallax } from '../hooks';

export function FinalCtaSection() {
  const { t } = useTranslation('landing');
  const mascotRef = useParallax<HTMLDivElement>(0.1);

  return (
    <section id="final-cta" className="relative py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="w-[min(1220px,92%)] mx-auto">
        {/* Единственный инвертированный блок страницы: вес финальному призыву
            даёт сплошная заливка pine, а не тень или свечение. */}
        <Reveal
          className="relative overflow-hidden rounded-[var(--radius)] text-center px-[clamp(1.5rem,5vw,3rem)] py-[clamp(3rem,7vw,5.5rem)]"
          style={{ background: 'var(--brand-solid)', border: '1px solid var(--brand-solid)' }}
        >
          <div
            ref={mascotRef}
            className="mascot-parallax top-[1.9rem] right-[2.4rem] w-[clamp(70px,7vw,92px)] max-[680px]:w-[60px] max-[680px]:top-[0.3rem] max-[680px]:right-[0.8rem]"
            style={{ '--rot': '8deg' } as React.CSSProperties}
            aria-hidden="true"
          >
            <Mascot state="completion" size="100%" blink={false} className="mascot-deco" />
          </div>

          <h2
            className="relative z-[1] font-display font-bold text-[clamp(1.75rem,3.6vw,2.6rem)] leading-[1.18] tracking-[-0.03em] text-balance"
            style={{ color: 'var(--on-brand-solid)' }}
          >
            {t('finalCta.titleLine1')}
            <br />
            <span style={{ color: 'var(--dawn-light)' }}>{t('finalCta.titleAccent')}</span>
          </h2>
          <p className="relative z-[1] mt-[1.1rem] text-[1.05rem]" style={{ color: 'color-mix(in srgb, var(--on-brand-solid) 76%, transparent)' }}>
            {t('finalCta.sub')}
          </p>

          <div className="relative z-[1] flex justify-center mt-[2.2rem]">
            {/* На заливке pine основная кнопка инвертируется: светлая плашка,
                тёмная надпись — иначе призыв слился бы с фоном. */}
            <CtaLink
              to="/register"
              size="lg"
              className="!bg-[var(--on-brand-solid)] !text-[var(--brand-solid)] hover:!bg-[color-mix(in_srgb,var(--on-brand-solid)_88%,var(--dawn-light))]"
            >
              {t('cta.takeDiagnostic')}
              <ArrowIcon />
            </CtaLink>
          </div>

          <div className="relative z-[1]">
            <TrustRow inverted center />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
