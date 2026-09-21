import { cn } from '@/shared/lib/cn';

export type ProgressBarVariant = 'brand' | 'accent' | 'success';

export interface ProgressBarProps {
  value: number; // 0 – 100
  variant?: ProgressBarVariant;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, variant = 'brand', className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full rounded-full bg-raised overflow-hidden', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-300 ease-out',
          variant === 'brand'   && 'bg-brand',
          variant === 'accent'  && 'bg-accent',
          variant === 'success' && 'bg-success',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
