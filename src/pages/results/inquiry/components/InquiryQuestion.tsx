import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

interface InquiryQuestionProps {
  index: number;
  text: string;
  scale: string[];
  value: number | null;
  onSelect: (index: number, value: number) => void;
}

function InquiryQuestionBase({ index, text, scale, value, onSelect }: InquiryQuestionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body font-semibold text-primary">
        <span className="text-brand">{index + 1}.</span> {text}
      </p>
      <div className="flex flex-wrap gap-2">
        {scale.map((label, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={value === i}
            onClick={() => onSelect(index, i)}
            className={cn(
              'px-3 py-1.5 rounded-pill text-caption font-semibold border transition-colors',
              value === i
                ? 'bg-brand text-on-brand border-brand'
                : 'bg-surface text-secondary border-default hover:border-strong',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const InquiryQuestion = memo(InquiryQuestionBase);
