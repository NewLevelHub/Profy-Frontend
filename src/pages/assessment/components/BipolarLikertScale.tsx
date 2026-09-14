import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';

const POINTS = [1, 2, 3, 4, 5] as const;
const NEUTRAL_VALUE = 3;

// Visible dot is 34px (per design — no size gradient across the scale, that
// would smuggle a second "how positive" signal into size). The tap target is
// 56px, matching ТЗ 29.3's answer-option minimum, which is larger than the
// generic --tap (48px) token used elsewhere in the product.
const DOT_SIZE = 34;
const TAP_SIZE = 56;

interface BipolarLikertScaleProps {
  selected: number | null;
  onSelect: (value: number) => void;
  /** Left-pole label, e.g. "Совсем не моё" — rendered uppercase in mono. */
  poleLeft?: string;
  /** Right-pole label, e.g. "Точно моё" — rendered uppercase in mono. */
  poleRight?: string;
}

// Bipolar 5-point scale. Poles are labeled at the edges only — labeling every
// dot would turn one question into five separate ones (design rationale).
// The middle (3rd) dot is the neutral point: unselected, it renders with a
// dashed hairline outline instead of the solid one used by points 1/2/4/5,
// so it reads as "not yet decided," not as a soft lean toward either pole.
// Selected dot (any of the 5 positions) always fills solid Pine.
export const BipolarLikertScale = React.memo(function BipolarLikertScale({
  selected,
  onSelect,
  poleLeft,
  poleRight,
}: BipolarLikertScaleProps) {
  const { t } = useTranslation();
  const leftLabel = poleLeft ?? t('assessment:scale.poleLeft');
  const rightLabel = poleRight ?? t('assessment:scale.poleRight');
  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <div className="relative flex items-center justify-between" role="radiogroup" aria-label={t('assessment:scale.rateAria')}>
        {/* Connecting hairline behind the dots — purely decorative track. */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: TAP_SIZE / 2,
            right: TAP_SIZE / 2,
            height: 1,
            background: 'var(--hairline)',
          }}
          aria-hidden
        />
        {POINTS.map(value => {
          const isSelected = selected === value;
          const isNeutral = value === NEUTRAL_VALUE;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                playClick('soft');
                onSelect(value);
              }}
              className={cn(
                'relative flex-none flex items-center justify-center transition-opacity duration-150',
                'focus-visible:outline-none focus-visible:ring-brand',
                !isSelected && 'hover:opacity-70',
              )}
              style={{ width: TAP_SIZE, height: TAP_SIZE, borderRadius: '50%' }}
              role="radio"
              aria-checked={isSelected}
              aria-label={t('assessment:scale.valueOfFive', { value })}
            >
              <span
                className="block flex-none transition-colors duration-150"
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: '50%',
                  background: isSelected ? 'var(--pine)' : 'var(--bg-surface)',
                  border: isSelected
                    ? '2px solid var(--pine)'
                    : isNeutral
                      ? '1.5px dashed var(--hairline)'
                      : '1.5px solid var(--hairline)',
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex items-start justify-between gap-3">
        <span
          className="font-mono text-tiny font-bold uppercase tracking-label text-muted text-left"
          style={{ maxWidth: 130 }}
        >
          {leftLabel}
        </span>
        <span
          className="font-mono text-tiny font-bold uppercase tracking-label text-muted text-right"
          style={{ maxWidth: 130 }}
        >
          {rightLabel}
        </span>
      </div>
    </div>
  );
});
