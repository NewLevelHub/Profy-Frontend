import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { cn } from '@/shared/lib/cn';
import { Accent, ArrowIcon, CtaLink, Reveal, SectionHead } from './primitives';

/* Шкала повторяет продуктовую: пять точек, крайние крупнее, галочка на
   выбранной. Размер и цвет — единственное, что отличает точки друг от друга. */
const DOT_META = [
  { value: 1, size: 's-far', color: 'var(--lake)' },
  { value: 2, size: 's-mid', color: 'var(--lake)' },
  { value: 3, size: 's-near', color: 'var(--border-strong)' },
  { value: 4, size: 's-mid', color: 'var(--pine)' },
  { value: 5, size: 's-far', color: 'var(--pine)' },
];

export function TrySection() {
  const { t } = useTranslation('landing');
  const [selected, setSelected] = useState<number | null>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const DOTS = DOT_META.map(d => ({ ...d, label: t(`try.dot${d.value}`) }));

  /* Стрелками ходим по шкале — это radiogroup, и с клавиатуры она должна
     вести себя как настоящая группа переключателей, а не как пять кнопок. */
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !back) return;
    e.preventDefault();
    const next = (index + (forward ? 1 : -1) + DOTS.length) % DOTS.length;
    setSelected(DOTS[next].value);
    dotRefs.current[next]?.focus();
  };

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

          <span className="inline-block font-mono text-[0.68rem] font-medium uppercase tracking-[0.06em] text-subtle border border-default rounded-pill px-[0.8rem] py-[0.35rem]">
            {t('try.exampleBadge')}
          </span>

          <p
            className="font-display font-semibold tracking-[-0.025em] text-[clamp(1.05rem,2.1vw,1.45rem)] leading-[1.35] mt-[1.2rem] mb-8 mx-auto max-w-[26ch] text-balance"
            style={{ color: 'var(--midnight)' }}
          >
            {t('try.statement')}
          </p>

          <div className="flex items-center justify-center gap-[clamp(.35rem,1.6vw,1.1rem)] max-[680px]:gap-[0.2rem]" role="radiogroup" aria-label={t('try.scaleAria')}>
            <span
              className="shrink-0 text-right font-semibold leading-[1.25] text-[clamp(.68rem,1.2vw,.8rem)] max-w-[clamp(4rem,10vw,6.5rem)] max-[680px]:max-w-[4.2rem]"
              style={{ color: 'var(--lake)' }}
            >
              {t('try.dot1')}
            </span>

            {DOTS.map((dot, i) => (
              <button
                key={dot.value}
                type="button"
                ref={el => { dotRefs.current[i] = el; }}
                role="radio"
                aria-checked={selected === dot.value}
                aria-label={dot.label}
                tabIndex={selected === null ? (i === 0 ? 0 : -1) : selected === dot.value ? 0 : -1}
                onClick={() => setSelected(dot.value)}
                onKeyDown={e => onKeyDown(e, i)}
                className={cn(
                  'lk-dot flex-none flex items-center justify-center min-w-11 min-h-11 rounded-full transition-transform hover:scale-[1.08] active:scale-95',
                  dot.size,
                )}
                style={{ color: dot.color }}
              >
                <i>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </i>
              </button>
            ))}

            <span
              className="shrink-0 text-left font-semibold leading-[1.25] text-[clamp(.68rem,1.2vw,.8rem)] max-w-[clamp(4rem,10vw,6.5rem)] max-[680px]:max-w-[4.2rem]"
              style={{ color: 'var(--pine)' }}
            >
              {t('try.dot5')}
            </span>
          </div>

          {/* Появляется только после ответа: пустой блок «про результат» до
              первого клика читался как незагрузившаяся половина карточки. */}
          {selected !== null && (
            <div className="try-result mt-8 pt-[1.7rem]" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <span className="block font-mono text-[0.68rem] uppercase tracking-[0.06em] text-subtle">
                {t('try.resultKicker')}
              </span>
              <strong
                className="inline-block mt-2 font-display font-bold tracking-[-0.03em] text-[clamp(1.3rem,2.6vw,1.8rem)]"
                style={{ color: 'var(--dawn-deep)' }}
              >
                {t('try.resultDirection')}
              </strong>
              <p className="mx-auto mt-[0.7rem] mb-[1.4rem] max-w-[52ch] text-[0.92rem] leading-[1.6] text-secondary">
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
