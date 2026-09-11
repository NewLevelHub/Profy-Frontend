import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight CSS-only tooltip (no portal, no positioning lib in this repo).
 * Shows on hover AND keyboard focus of the wrapped trigger, so it works for
 * disabled-with-reason buttons reached via Tab, not just the mouse.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn('relative inline-flex group/tooltip', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 -translate-x-1/2',
          'whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-xs font-semibold',
          'bg-inverse text-inverse',
          'opacity-0 scale-95 transition-all duration-150',
          'group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100',
          'group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100',
        )}
      >
        {content}
      </span>
    </span>
  );
}
