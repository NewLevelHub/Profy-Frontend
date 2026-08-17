import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds an elevated pop shadow instead of the default card shadow */
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface border border-default rounded-[var(--radius)]',
        elevated && 'shadow-pop',
        'p-4 sm:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
