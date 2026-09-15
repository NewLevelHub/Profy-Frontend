import { memo } from 'react';
import { cn } from '@/shared/lib/cn';

export type ChipVariant = 'solid' | 'outline' | 'muted';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
}

const VARIANT_CLASS: Record<ChipVariant, string> = {
  solid: 'bg-brand text-on-brand shadow-[0_6px_14px_color-mix(in_srgb,var(--pine)_22%,transparent)]',
  outline: 'border border-[color:color-mix(in_srgb,var(--pine)_35%,var(--border))] text-brand bg-[color-mix(in_srgb,var(--pine)_7%,transparent)]',
  muted: 'border border-[color:color-mix(in_srgb,#fff_45%,var(--border))] text-secondary field-tile',
};

function ChipBase({ label, variant = 'solid' }: ChipProps) {
  return (
    <span className={cn('px-3 py-1 rounded-pill font-semibold text-body-sm', VARIANT_CLASS[variant])}>
      {label}
    </span>
  );
}

export const Chip = memo(ChipBase);
