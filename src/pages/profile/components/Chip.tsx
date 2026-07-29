import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

export interface ChipProps {
  label: string;
  accent?: 'green' | 'orange';
}

function ChipBase({ label, accent }: ChipProps) {
  return (
    <span
      className={cn(
        'px-[15px] py-[7px] rounded-pill font-extrabold text-[14px]',
        accent === 'green' && 'bg-success-subtle text-success-text',
        accent === 'orange' && 'bg-accent-soft text-accent-text',
        !accent && 'bg-brand-subtle text-brand-text',
      )}
    >
      {label}
    </span>
  );
}

export const Chip = memo(ChipBase);
