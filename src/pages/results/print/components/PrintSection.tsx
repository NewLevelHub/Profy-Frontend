import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { type as typeClass } from '@/shared/ui/typography/tokens';

interface PrintSectionProps {
  kicker: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * One block of the printed document. Same kicker vocabulary as the
 * on-screen DomainKicker, but no card frame: on paper the page itself is
 * the frame, and nesting bordered cards inside a bordered sheet reads as
 * noise (and wastes the vertical space that decides how many pages the PDF
 * runs to).
 *
 * Deliberately NOT `print-block` (break-inside: avoid) at the section
 * level — "ПОДХОДЯЩИЕ НАПРАВЛЕНИЯ" alone can run several cards past a
 * single page. WebKit's print engine doesn't reliably fall back to
 * splitting when a break-avoid block is taller than a full page (it's
 * supposed to, per spec, but in practice this is where the live print
 * preview's page count and the actual saved PDF's page count have been
 * observed to disagree) — so keep-together stays only on the small atomic
 * pieces inside a section (PrintNoteList/PrintLevelRows/PrintNextSteps
 * list items), never on the section as a whole.
 */
export function PrintSection({ kicker, title, children, className }: PrintSectionProps) {
  return (
    <section className={cn('space-y-2', className)} aria-label={title ?? kicker}>
      <p className={cn(typeClass.monoLabel, 'text-muted')}>{kicker}</p>
      {title && (
        <p className="text-body-md font-semibold text-[color:var(--text-heading)] leading-snug">
          {title}
        </p>
      )}
      {children}
    </section>
  );
}
