import React from 'react';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import type { QuestionPairOption } from '@/shared/types';

interface PairChoiceProps {
  frame: string | null;
  optionA: QuestionPairOption;
  optionB: QuestionPairOption;
  onSelect: (questionId: string) => void;
  selected: string | null;
}

function PairCard({
  option,
  isSelected,
  onSelect,
}: {
  option: QuestionPairOption;
  isSelected: boolean;
  onSelect: (questionId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        playClick('soft');
        onSelect(option.id);
      }}
      className={cn(
        'flex-1 flex flex-col items-center gap-3 border-2 px-4 py-8 transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-brand',
        isSelected
          ? 'border-brand bg-active-tint'
          : 'border-default bg-surface text-primary hover:border-brand',
      )}
      style={{ borderRadius: 18 }}
    >
      {option.icon && <span style={{ fontSize: 44, lineHeight: 1 }}>{option.icon}</span>}
      <span className="font-bold text-primary text-center text-body-md">
        {option.text}
      </span>
    </button>
  );
}

export const PairChoice = React.memo(function PairChoice({
  frame,
  optionA,
  optionB,
  onSelect,
  selected,
}: PairChoiceProps) {
  return (
    <div className="flex flex-col gap-5">
      {frame && (
        <p className="font-semibold text-secondary text-center text-body-sm">
          {frame}
        </p>
      )}
      <div className="flex gap-4">
        <PairCard option={optionA} isSelected={selected === optionA.id} onSelect={onSelect} />
        <PairCard option={optionB} isSelected={selected === optionB.id} onSelect={onSelect} />
      </div>
    </div>
  );
});
