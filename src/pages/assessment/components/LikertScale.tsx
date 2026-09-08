import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { LIKERT_SCALE } from '@/shared/config/constants';

interface LikertScaleProps {
  selected: number | null;
  onSelect: (value: number) => void;
  scale?: { value: number; label: string }[];
}

const POLE_LEFT = 'var(--pole-left)';
const POLE_RIGHT = 'var(--pole-right)';
const POLE_NEUTRAL = 'var(--hairline)';

function poleColor(index: number, count: number) {
  const mid = (count - 1) / 2;
  if (index < mid) return POLE_LEFT;
  if (index > mid) return POLE_RIGHT;
  return POLE_NEUTRAL;
}

function dotSize(index: number, count: number) {
  const dist = Math.abs(index - (count - 1) / 2);
  if (dist >= 2) return 'clamp(2rem, 4.8vw, 3.25rem)';
  if (dist >= 1) return 'clamp(1.45rem, 3.4vw, 2.35rem)';
  return 'clamp(1rem, 2.2vw, 1.5rem)';
}

export const LikertScale = React.memo(function LikertScale({
  selected,
  onSelect,
  scale = LIKERT_SCALE,
}: LikertScaleProps) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center justify-center w-full gap-[clamp(0.4rem,2vw,1.5rem)]"
      role="radiogroup"
      aria-label={t('assessment:scale.rateAria')}
    >
      <span
        className="shrink-0 text-right font-semibold leading-tight"
        style={{ color: POLE_LEFT, fontSize: 'clamp(0.75rem, 1.6vw, 1rem)', maxWidth: 'clamp(4.5rem, 14vw, 7.5rem)' }}
      >
        {t('assessment:scale.poleLeft')}
      </span>

      {scale.map(({ value, label }, index) => {
        const isSelected = selected === value;
        const color = poleColor(index, scale.length);
        const size = dotSize(index, scale.length);

        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              playClick('soft');
              onSelect(value);
            }}
            className={cn(
              'relative flex-none flex items-center justify-center',
              'min-w-11 min-h-11',
              'transition-transform duration-150 hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
            )}
            style={{ borderRadius: '50%' }}
            role="radio"
            aria-checked={isSelected}
            aria-label={t(label)}
          >
            <span
              className="flex items-center justify-center transition-colors duration-150"
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: isSelected ? color : 'transparent',
                border: `clamp(1.5px, 0.18vw, 2px) solid ${color}`,
              }}
            >
              {isSelected && (
                <Check
                  className="w-[42%] h-[42%] likert-check-pop"
                  strokeWidth={3}
                  color="#fff"
                  aria-hidden
                />
              )}
            </span>
          </button>
        );
      })}

      <span
        className="shrink-0 text-left font-semibold leading-tight"
        style={{ color: POLE_RIGHT, fontSize: 'clamp(0.75rem, 1.6vw, 1rem)', maxWidth: 'clamp(4.5rem, 14vw, 7.5rem)' }}
      >
        {t('assessment:scale.poleRight')}
      </span>
    </div>
  );
});
