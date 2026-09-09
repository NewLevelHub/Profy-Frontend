import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface BackLinkProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
}

/**
 * Textual "back" control for journey detail screens (direction → roadmap →
 * programs, university detail, inquiry). Always shows a left arrow so the
 * affordance reads as navigation, not as a plain label.
 */
export function BackLink({ children, className, type = 'button', ...props }: BackLinkProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-1.5 w-fit border-none bg-transparent cursor-pointer p-0',
        'text-brand font-semibold text-label hover:opacity-70 transition-opacity',
        className,
      )}
      {...props}
    >
      <ArrowLeft className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}
