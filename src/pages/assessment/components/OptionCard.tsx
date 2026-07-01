import React from 'react';
import { cn } from '@/shared/lib/cn';
import type { AgeGroup } from '@/shared/types';

const LETTERS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З'];

interface OptionCardProps {
  text: string;
  index: number;
  selected: boolean;
  ageGroup: AgeGroup;
  onPress: () => void;
}

export const OptionCard = React.memo(function OptionCard({
  text,
  index,
  selected,
  onPress,
}: OptionCardProps) {
  const letter = LETTERS[index] ?? String(index + 1);

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'w-full flex items-center gap-[14px] text-left border-2 px-5 py-[18px] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-brand',
        selected
          ? 'border-brand bg-active-tint'
          : 'border-default bg-surface text-primary hover:border-[#C4B5FD]',
      )}
      style={{ borderRadius: 18, boxShadow: '0 4px 14px rgba(30,27,75,.04)' }}
    >
      <span
        className="w-[34px] h-[34px] flex-none flex items-center justify-center font-black"
        style={{
          borderRadius: 10,
          fontSize: 15,
          background: selected ? 'var(--brand)' : 'var(--bg-active)',
          color: selected ? '#fff' : 'var(--brand)',
        }}
      >
        {letter}
      </span>
      <span className="flex-1 font-bold text-primary leading-snug" style={{ fontSize: 16 }}>
        {text}
      </span>
    </button>
  );
});
