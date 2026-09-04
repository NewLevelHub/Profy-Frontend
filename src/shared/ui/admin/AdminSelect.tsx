import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_INPUT } from '@/shared/ui/admin/density';

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Sizing for the whole control — put `max-w-*` here, not on the select. */
  className?: string;
}

/**
 * The dropdown used by every admin form.
 *
 * A bare `<select>` carrying `ADMIN_INPUT` still renders the operating
 * system's own control: on macOS that is a grey rounded button with a blue
 * double-chevron and the system font, sitting in a form where every other
 * control is a hairline box in the product's palette. The border, radius and
 * focus ring in the class were being drawn *around* something that ignored
 * them, so the form read as half-built.
 *
 * `appearance-none` plus a drawn chevron makes it match the text inputs beside
 * it, and matches the filter selects in `AdminToolbar`, which already do this.
 */
export function AdminSelect({ className, children, ...props }: AdminSelectProps) {
  // The border lives on the inner element, so an `invalid` class passed on the
  // wrapper would never be seen — read the ARIA state instead.
  const invalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <span className={cn('relative inline-flex items-center w-full', className)}>
      <select
        {...props}
        className={cn(ADMIN_INPUT, 'appearance-none pr-8 cursor-pointer', invalid && 'border-danger')}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        aria-hidden="true"
        className="absolute right-2.5 text-muted pointer-events-none"
      />
    </span>
  );
}
