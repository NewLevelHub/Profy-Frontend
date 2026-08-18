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
      <div className="w-full flex flex-col">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-mono text-mono-xs tracking-label uppercase transition-colors mb-1',
              error ? 'text-danger' : 'text-muted',
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-transparent border-0 border-b-[1.5px] px-0 py-[9px] text-body-md font-book text-primary rounded-none',
            'placeholder:text-placeholder',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-[border-color] duration-[160ms] ease',
            error ? 'border-danger focus:border-danger' : 'border-strong focus:border-brand',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="field-error-in text-body-sm font-book text-danger mt-[8px]" role="alert">
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
