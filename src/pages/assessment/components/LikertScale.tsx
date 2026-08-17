import React from 'react';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import { LIKERT_SCALE } from '@/shared/config/constants';

interface LikertScaleProps {
  selected: number | null;
  onSelect: (value: number) => void;
  scale?: { value: number; label: string }[];
}

export const LikertScale = React.memo(function LikertScale({
  selected,
  onSelect,
  scale = LIKERT_SCALE,
}: LikertScaleProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      {scale.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => {
              playClick('soft');
              onSelect(value);
            }}
            className={cn(
              'w-full flex items-center gap-[14px] text-left border-2 px-5 py-[18px] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-brand',
              isSelected
                ? 'border-brand bg-active-tint'
                : 'border-default bg-surface text-primary hover:border-brand',
            )}
            style={{ borderRadius: 18 }}
          >
            <span
              className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
              style={{
                borderRadius: 10,
                fontSize: 15,
                background: isSelected ? 'var(--brand)' : 'var(--bg-active)',
                color: isSelected ? '#fff' : 'var(--brand)',
              }}
            >
              {value}
            </span>
            <span className="flex-1 font-bold text-primary leading-snug" style={{ fontSize: 16 }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
});
