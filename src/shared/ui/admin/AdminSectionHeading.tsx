import { createContext, useContext, type ReactNode } from 'react';
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
    <div className={cn('admin-section-heading flex items-start justify-between gap-3 flex-wrap', className)}>
      <div className="min-w-0">
        <h2 className="font-sans text-body-lg sm:text-display-sm font-bold text-primary m-0 tracking-tight">{title}</h2>
        {description && <p className="font-sans text-body-md text-muted mt-1.5 max-w-[68ch] leading-relaxed">{description}</p>}
      </div>
      {aside && <div className="flex-shrink-0">{aside}</div>}
    </div>
  );
}

/**
 * Inside an `AdminCardEmbed` an `AdminCard` drops its own shell and heading
 * and renders just its content — for a container that already shows the
 * title (the psychologist report's accordion rows), so a section component
 * doesn't need a second, chrome-less copy of itself.
 */
const AdminCardEmbedContext = createContext(false);

export function AdminCardEmbed({ children }: { children: ReactNode }) {
  return <AdminCardEmbedContext.Provider value>{children}</AdminCardEmbedContext.Provider>;
}

/** Card shell for admin forms — heading, hairline edge, consistent padding. */
export function AdminCard({
  title,
  description,
  aside,
  children,
  className,
}: AdminSectionHeadingProps & { children: ReactNode }) {
  const embedded = useContext(AdminCardEmbedContext);
  if (embedded) {
    return (
      <div className={cn('flex flex-col gap-3.5', className)}>
        {aside && <div className="flex justify-end">{aside}</div>}
        {children}
      </div>
    );
  }
  return (
    <section className={cn(ADMIN_CARD, 'flex flex-col gap-3.5', className)}>
      <AdminSectionHeading title={title} description={description} aside={aside} />
      {children}
    </section>
  );
}
