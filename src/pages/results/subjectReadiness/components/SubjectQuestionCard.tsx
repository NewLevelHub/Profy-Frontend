import { memo } from 'react';
import { cn } from '@/shared/lib/cn';
import type { SubjectQuestion } from '@/shared/types';

interface SubjectQuestionCardProps {
  question: SubjectQuestion;
  selectedIndex: number | undefined;
  onSelect: (questionId: string, index: number) => void;
}

export const SubjectQuestionCard = memo(function SubjectQuestionCard({
  question,
  selectedIndex,
  onSelect,
}: SubjectQuestionCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:p-6 rounded-[var(--radius-lg)] border-2 border-strong bg-raised">
      <p className="text-body font-extrabold text-primary text-pretty">{question.text}</p>
      <div className="flex flex-col gap-2">
        {question.options.map(option => (
          <button
            key={option.index}
            type="button"
            onClick={() => onSelect(question.id, option.index)}
            className={cn(
              'text-left px-4 py-3 rounded-[var(--radius-sm)] border-2 transition-colors text-label',
              selectedIndex === option.index
                ? 'border-brand bg-active-tint text-primary font-semibold'
                : 'border-transparent text-secondary hover:border-strong hover:bg-surface',
            )}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
});
