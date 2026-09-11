import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CARD, ADMIN_TEXT } from '@/shared/ui/admin/density';

interface AdminSectionHeadingProps {
  title: string;
  /** One line on what this section governs — replaces footnotes under the card. */
  description?: ReactNode;
  /** Right-aligned slot: a count, a status marker. */
  aside?: ReactNode;
  className?: string;
}

/**
 * Card-level heading for admin screens.
 *
 * Sans semibold, not mono uppercase: a card title is read, not scanned as a
 * machine label. Uppercase mono is now reserved for table column headers and
 * field labels — the two places where a wall of short labels genuinely needs
 * to read as a different kind of thing from the values beside it.
 */
export function AdminSectionHeading({ title, description, aside, className }: AdminSectionHeadingProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 flex-wrap', className)}>
      <div className="min-w-0">
        <h2 className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{title}</h2>
        {description && <p className={cn(ADMIN_TEXT, 'text-muted mt-1 max-w-[64ch]')}>{description}</p>}
      </div>
      {aside && <div className="flex-shrink-0">{aside}</div>}
    </div>
  );
}

/** Card shell for admin forms — heading, hairline edge, consistent padding. */
export function AdminCard({
  title,
  description,
  aside,
  children,
  className,
}: AdminSectionHeadingProps & { children: ReactNode }) {
  return (
    <section className={cn(ADMIN_CARD, 'flex flex-col gap-3.5', className)}>
      <AdminSectionHeading title={title} description={description} aside={aside} />
      {children}
    </section>
  );
}
