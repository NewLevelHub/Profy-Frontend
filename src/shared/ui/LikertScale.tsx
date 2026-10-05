import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { LIKERT_SCALE } from '@/shared/config/constants';

interface LikertScaleProps {
  selected: number | null;
  onSelect: (value: number) => void;
  /** `label` is an i18n key with its namespace (`assessment:likert.1`). */
  scale?: { value: number; label: string }[];
  /** Override the flanking pole text — the generic "Совсем не моё…Точно моё"
   * doesn't fit professional_types_abilities' "выражено" framing (PRO-338
   * Ф1.2) nor kondash_anxiety's "тревожит" (PRO-435); see
   * `polesForInstrument` in LikertPage. Defaults to the generic pair, unused
   * by the 2-option branch. */
  poleLeft?: string;
  poleRight?: string;
  ariaLabel?: string;
}

const POLE_LEFT = 'var(--pole-left)';
const POLE_RIGHT = 'var(--pole-right)';
const POLE_NEUTRAL = 'var(--hairline)';
// The hairline ring is fine for an idle dot, but a filled hairline disc with
// a white check barely read as "chosen" (light) and vanished on dark.
const POLE_NEUTRAL_SELECTED = 'var(--text-subtle)';

function poleColor(index: number, count: number) {
  const mid = (count - 1) / 2;
  if (index < mid) return POLE_LEFT;
  if (index > mid) return POLE_RIGHT;
  return POLE_NEUTRAL;
}

/* Sizes go by distance from the nearest END of the scale, not from its
   centre: the ends are always the large dots, whatever the option count.
   Measuring from the centre made the 4-point abilities scale top out at the
   5-point scale's middle size — the same component looked a size smaller on
   one test.
   Everything switches at one container width (the scale's own, not the
   viewport's): the card is the same 654px at a 768px and a 1440px window, and
   vw-based clamps drew it ~30% smaller at 768 next to the same 22px question.
   Below the switch the pole labels move under the dots — beside them the row
   needs ~38rem and overflowed the card on phones, clipping the labels. */
const DOT_SIZE = [
  'size-10 @min-[39rem]:size-13',
  'size-7.5 @min-[39rem]:size-9.5',
  'size-5.5 @min-[39rem]:size-6',
] as const;

function dotSize(index: number, count: number) {
  const fromEnd = Math.min(index, count - 1 - index);
  return DOT_SIZE[Math.min(fromEnd, DOT_SIZE.length - 1)];
}

/* A radiogroup is one tab stop: Tab lands on the chosen option (or the first
   one), arrows move the choice — the native radio contract. */
function useRovingRadio(count: number, selectedIndex: number, onSelectIndex: (index: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabIndex = (index: number) => (index === (selectedIndex === -1 ? 0 : selectedIndex) ? 0 : -1);
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !back) return;
    e.preventDefault();
    const next = (index + (forward ? 1 : -1) + count) % count;
    onSelectIndex(next);
    refs.current[next]?.focus();
  };
  return { refs, tabIndex, onKeyDown };
}

export const LikertScale = React.memo(function LikertScale({
  selected,
  onSelect,
  scale = LIKERT_SCALE,
  poleLeft,
  poleRight,
  ariaLabel,
}: LikertScaleProps) {
  const { t } = useTranslation();
  const selectedIndex = scale.findIndex(option => option.value === selected);
  const radio = useRovingRadio(scale.length, selectedIndex, index => onSelect(scale[index].value));
  const groupLabel = ariaLabel ?? t('assessment:scale.rateAria');

  // PRO-338 Ф0.5: a 2-option (Да/Нет) scale renders as two labeled pill
  // buttons, not dots — the "poleLeft…poleRight" flanking text below is
  // meaningless for a plain yes/no question (there's no gradient to anchor),
  // and the dot itself carries no visible text otherwise.
  if (scale.length === 2) {
    return (
      <div className="flex items-center justify-center gap-4" role="radiogroup" aria-label={groupLabel}>
        {scale.map(({ value, label }, index) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              ref={el => {
                radio.refs.current[index] = el;
              }}
              type="button"
              onClick={() => onSelect(value)}
              onKeyDown={e => radio.onKeyDown(e, index)}
              tabIndex={radio.tabIndex(index)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'min-w-28 px-8 py-3.5 rounded-pill font-semibold text-body-lg border-2',
                'transition-transform duration-150 hover:scale-105 active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
              )}
              style={{
                borderColor: isSelected ? 'var(--brand)' : 'var(--hairline)',
                background: isSelected ? 'var(--brand)' : 'transparent',
                color: isSelected ? 'var(--text-on-brand)' : 'var(--text-heading)',
              }}
            >
              {t(label)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="@container w-full">
      <div
        className={cn(
          'mx-auto flex w-full max-w-80 flex-wrap justify-between gap-y-2',
          '@min-[39rem]:max-w-none @min-[39rem]:flex-nowrap @min-[39rem]:items-center @min-[39rem]:justify-center @min-[39rem]:gap-x-4',
        )}
        role="radiogroup"
        aria-label={groupLabel}
      >
        {/* Equal-width columns on both sides keep the dots dead centre no
            matter how long a test's pole text is. */}
        <span
          className="w-1/2 pr-2 text-left text-body-sm font-semibold leading-tight @min-[39rem]:w-30 @min-[39rem]:pr-0 @min-[39rem]:text-right @min-[39rem]:text-body-md"
          style={{ color: POLE_LEFT }}
        >
          {poleLeft ?? t('assessment:scale.poleLeft')}
        </span>

        <div className="order-first flex w-full justify-between @min-[39rem]:order-none @min-[39rem]:w-auto @min-[39rem]:gap-5">
          {scale.map(({ value, label }, index) => {
            const isSelected = selected === value;
            const ring = poleColor(index, scale.length);
            const color = isSelected && ring === POLE_NEUTRAL ? POLE_NEUTRAL_SELECTED : ring;

            return (
              <button
                key={value}
                ref={el => {
                  radio.refs.current[index] = el;
                }}
                type="button"
                onClick={() => onSelect(value)}
                onKeyDown={e => radio.onKeyDown(e, index)}
                tabIndex={radio.tabIndex(index)}
                className={cn(
                  'flex-none flex items-center justify-center size-11 @min-[39rem]:size-13 rounded-full',
                  'transition-transform duration-150 hover:scale-105 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
                )}
                role="radio"
                aria-checked={isSelected}
                aria-label={t(label)}
              >
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-colors duration-150',
                    dotSize(index, scale.length),
                  )}
                  style={{ borderColor: color, background: isSelected ? color : 'transparent' }}
                >
                  {isSelected && (
                    <Check className="w-[42%] h-[42%] likert-check-pop" strokeWidth={3} color="var(--text-on-brand)" aria-hidden />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <span
          className="w-1/2 pl-2 text-right text-body-sm font-semibold leading-tight @min-[39rem]:w-30 @min-[39rem]:pl-0 @min-[39rem]:text-left @min-[39rem]:text-body-md"
          style={{ color: POLE_RIGHT }}
        >
          {poleRight ?? t('assessment:scale.poleRight')}
        </span>
      </div>
    </div>
  );
});
