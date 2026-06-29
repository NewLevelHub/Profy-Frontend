import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[var(--radius-sm)] border bg-surface px-4 py-2.5 text-sm text-primary',
            'placeholder:text-placeholder transition-colors',
            'focus:outline-none focus:border-brand focus:ring-brand',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-danger' : 'border-default',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
