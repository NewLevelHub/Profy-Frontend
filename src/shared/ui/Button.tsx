import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Отключить звук клика (например, в админке) */
  muteSound?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, muteSound, className, children, disabled, onClick, ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={(event) => {
          if (!isDisabled && !muteSound) playClick();
          onClick?.(event);
        }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius)] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',

          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',

          variant === 'primary' && [
            'bg-brand text-on-brand',
            'hover:bg-brand-hover',
          ],
          variant === 'ghost' && [
            'bg-transparent text-brand border border-default',
            'hover:bg-raised hover:border-strong',
          ],

          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
