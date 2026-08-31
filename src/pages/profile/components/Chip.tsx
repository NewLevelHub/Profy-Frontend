import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

export type ChipVariant = 'solid' | 'outline' | 'muted';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
}

const VARIANT_CLASS: Record<ChipVariant, string> = {
  solid: 'bg-brand text-on-brand',
  outline: 'border border-brand text-brand bg-transparent',
  muted: 'border border-default text-secondary bg-surface',
};

function ChipBase({ label, variant = 'solid' }: ChipProps) {
  return (
    <span className={cn('px-3 py-1 rounded-pill font-semibold text-body-sm', VARIANT_CLASS[variant])}>
      {label}
    </span>
  );
}

export const Chip = memo(ChipBase);
