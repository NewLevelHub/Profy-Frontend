import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

interface ProfessionListItemProps {
  name: string;
  subtitle?: string | null;
  selected: boolean;
  onSelect: () => void;
}

export const ProfessionListItem = memo(function ProfessionListItem({
  name,
  subtitle,
  selected,
  onSelect,
}: ProfessionListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-center justify-between gap-3.5 w-full text-left border-[1.5px] rounded-[16px] px-6 py-[22px] transition-all duration-[180ms]',
        selected
          ? 'bg-brand-subtle border-brand text-brand-text'
          : 'bg-surface border-default text-primary hover:border-[#C4B5FD] hover:bg-hover',
      )}
    >
      <span className="flex flex-col min-w-0 flex-1">
        <span className="font-extrabold text-[18px]">{name}</span>
        {subtitle && (
          <span className="text-xs font-semibold mt-0.5 text-secondary">{subtitle}</span>
        )}
      </span>
      <span
        className={cn('text-[18px] font-black shrink-0', selected ? 'text-brand' : 'text-[#A78BFA]')}
        aria-hidden="true"
      >
        ›
      </span>
    </button>
  );
});
