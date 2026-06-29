import React from 'react';
import { cn } from '@/shared/lib/cn';
import type { AgeGroup } from '@/shared/types';

interface OptionCardProps {
  text: string;
  index: number;
  selected: boolean;
  ageGroup: AgeGroup;
  onPress: () => void;
}

export const OptionCard = React.memo(function OptionCard({
  text,
  selected,
  ageGroup,
  onPress,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'w-full text-left rounded-xl border px-4 py-3 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-brand',
        ageGroup === 'junior' ? 'text-body py-4' : 'text-label',
        selected
          ? 'border-brand bg-active-tint text-brand font-semibold shadow-card'
          : 'border-default bg-surface text-primary hover:border-strong hover:bg-raised',
      )}
    >
      {text}
    </button>
  );
});
