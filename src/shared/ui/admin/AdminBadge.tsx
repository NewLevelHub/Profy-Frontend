import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';

export type AdminBadgeTone = 'neutral' | 'brand' | 'accent' | 'danger' | 'quiet';

interface AdminBadgeProps {
  tone?: AdminBadgeTone;
  /** Small filled circle before the label — for state, not decoration. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
  title?: string;
}

/**
 * One chip for every in-row marker: status, role, flag.
 *
 * Statuses in the users table used to be styled per value — "Завершена" got a
 * tinted pill, "Не начата" was bare uppercase mono text — so one column read as
 * two different kinds of thing. A status is a status; the tone carries the
 * meaning, the shape stays constant.
 *
 * Sentence case, not caps: these sit inside rows of sentence-case content, and
 * uppercase made every row's least important cell its loudest.
 */
export function AdminBadge({ tone = 'neutral', dot, children, className, title }: AdminBadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        ADMIN_TEXT,
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill whitespace-nowrap font-medium',
        tone === 'neutral' && 'bg-raised text-secondary',
        tone === 'brand' && 'bg-brand-subtle text-brand',
        tone === 'accent' && 'bg-accent-soft text-accent',
        tone === 'danger' && 'bg-danger-subtle text-danger',
        tone === 'quiet' && 'border border-dashed border-default text-muted',
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            tone === 'accent' && 'bg-[color:var(--dawn)]',
            tone === 'brand' && 'bg-[color:var(--pine)]',
            tone === 'danger' && 'bg-[color:var(--clay)]',
            (tone === 'neutral' || tone === 'quiet') && 'bg-[color:var(--mute)]',
          )}
        />
      )}
      {children}
    </span>
  );
}
