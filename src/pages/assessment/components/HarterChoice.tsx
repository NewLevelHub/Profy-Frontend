import React from 'react';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import type { MotivationPairSide } from '@/shared/types';

interface HarterChoiceProps {
  textA: string;
  textB: string;
  onSelect: (side: MotivationPairSide) => void;
  selected: MotivationPairSide | null;
}

function HarterCard({
  text,
  isSelected,
  onClick,
}: {
  text: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick('soft');
        onClick();
      }}
      className={cn(
        'w-full text-left border-2 px-5 py-[18px] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-brand',
        isSelected
          ? 'border-brand bg-active-tint'
          : 'border-default bg-surface text-primary hover:border-brand',
      )}
      style={{ borderRadius: 18 }}
    >
      <span className="font-bold text-primary leading-snug text-body-md">
        {text}
      </span>
    </button>
  );
}

// Step 1 of the Harter format: "Some kids like X, but other kids [prefer]
// Y" — pick a camp. Step 2 (intensity: "Точно про меня" / "Немного про
// меня") is a separate small button pair rendered by the page after a side
// is picked, not part of this component.
export const HarterChoice = React.memo(function HarterChoice({
  textA,
  textB,
  onSelect,
  selected,
}: HarterChoiceProps) {
  return (
    <div className="flex flex-col gap-4">
      <HarterCard text={textA} isSelected={selected === 'a'} onClick={() => onSelect('a')} />
      <HarterCard text={textB} isSelected={selected === 'b'} onClick={() => onSelect('b')} />
    </div>
  );
});
