import { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type BadgeVariant = 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full font-mono text-mono-xs tracking-label uppercase leading-tight',
        variant === 'default'  && 'bg-raised text-secondary',
        variant === 'brand'    && 'bg-brand-subtle text-brand',
        variant === 'accent'   && 'bg-accent-soft text-accent',
        variant === 'success'  && 'bg-success-subtle text-success',
        variant === 'warning'  && 'bg-warning-subtle text-warning',
        variant === 'danger'   && 'bg-danger-subtle text-danger',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
