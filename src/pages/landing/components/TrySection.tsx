import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LikertScale } from '@/shared/ui';
import { Mascot } from '@/shared/ui/Mascot';
import { Accent, ArrowIcon, CtaLink, Reveal, SectionHead } from './primitives';

/* Та же шкала, что в тесте, — тем же компонентом: своя копия расходилась с
   продуктовой размерами и цветами полюсов. */
const SCALE = [1, 2, 3, 4, 5].map(value => ({ value, label: `landing:try.dot${value}` }));

export function TrySection() {
  const { t } = useTranslation('landing');
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="try" className="section-gradient relative py-[clamp(4.5rem,8vw,7.5rem)]">
      <div className="w-[min(1220px,92%)] mx-auto">
        <Reveal>
          <SectionHead
            center
            eyebrow={t('try.eyebrow')}
            title={<>{t('try.titlePre')}<Accent>{t('try.titleAccent')}</Accent></>}
            sub={t('try.sub')}
          />
        </Reveal>

        <Reveal
          delay={1}
          className="relative w-[min(760px,100%)] mx-auto bg-surface border border-default rounded-[var(--radius)] text-center px-[clamp(1.3rem,4vw,3rem)] py-[clamp(1.8rem,4vw,2.8rem)]"
        >
          <div
            className="absolute -top-11 right-[clamp(4px,2vw,28px)] w-[clamp(72px,9vw,104px)] pointer-events-none max-[680px]:w-16 max-[680px]:-top-[30px]"
            aria-hidden="true"
          >
            <Mascot state="pause" size="100%" blink={false} className="mascot-deco" />
          </div>

          <span className="inline-block font-mono text-mono-xs font-medium uppercase tracking-[0.06em] text-subtle border border-default rounded-pill px-[0.8rem] py-[0.35rem]">
            {t('try.exampleBadge')}
          </span>

          <p
            className="font-display font-semibold tracking-[-0.025em] text-display-sm leading-[1.35] mt-[1.2rem] mb-8 mx-auto max-w-[26ch] text-balance"
            style={{ color: 'var(--text-heading)' }}
          >
            {t('try.statement')}
          </p>

          <LikertScale
            selected={selected}
            onSelect={setSelected}
            scale={SCALE}
            poleLeft={t('try.dot1')}
            poleRight={t('try.dot5')}
            ariaLabel={t('try.scaleAria')}
          />

          {/* Появляется только после ответа: пустой блок «про результат» до
              первого клика читался как незагрузившаяся половина карточки. */}
          {selected !== null && (
            <div className="try-result mt-8 pt-[1.7rem]" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <span className="block font-mono text-mono-xs uppercase tracking-[0.06em] text-subtle">
                {t('try.resultKicker')}
              </span>
              <strong
                className="inline-block mt-2 font-display font-bold tracking-[-0.03em] text-display-md"
                style={{ color: 'var(--dawn-deep)' }}
              >
                {t('try.resultDirection')}
              </strong>
              <p className="mx-auto mt-[0.7rem] mb-[1.4rem] max-w-[52ch] text-body-sm leading-[1.6] text-secondary">
                {t('try.resultDesc')}
              </p>
              <CtaLink to="/register" size="sm">
                {t('cta.takeDiagnostic')}
                <ArrowIcon />
              </CtaLink>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
