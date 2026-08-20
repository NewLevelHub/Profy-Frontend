import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds an elevated pop shadow instead of the default card shadow */
  elevated?: boolean;
  /** Marks this card as the chosen one in a "pick one" list — thicker brand
   *  border + a faint brand tint, instead of a one-off inline style per caller */
  selected?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, selected, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface border rounded-[var(--radius)]',
        selected
          ? 'border-2 border-[color:var(--brand)] bg-[color:color-mix(in_srgb,var(--brand)_5%,var(--bg-surface))]'
          : 'border-default',
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
