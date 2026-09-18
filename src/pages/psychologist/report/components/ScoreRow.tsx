import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_META } from '@/shared/ui/admin/density';

interface ScoreRowProps {
  label: ReactNode;
  value?: ReactNode;
  badge?: ReactNode;
  isOpen?: boolean;
  /** Omit to render a static, button-less row (nothing to expand into — e.g.
   *  no methodology entry exists for this key). Passing it always renders
   *  the interactive bordered-button variant, REGARDLESS of what `children`
   *  happens to evaluate to on a given render. */
  onToggle?: () => void;
  /** Detail content (typically a <PsychDetailCard>) — rendered inline, right
   *  under this row, only while `isOpen`. */
  children?: ReactNode;
  className?: string;
}

/**
 * One clickable score row across every psychologist report section
 * (IntelligenceSection, TeamRoleSection, TemperamentSection,
 * ProfessionalTypesSection, EmpathyConfidenceSection, AspirationLevelSection).
 *
 * Replaces the old bare-button rows (no border, hover-only feedback, a
 * decorative-looking chevron right after the label) that psychologists
 * reported as "not obviously clickable" — nothing distinguished them from a
 * plain data row at rest, and the detail card used to render at the very
 * bottom of the section instead of under the row that was clicked.
 *
 * Fix: a visible border at rest (reads as a control, not text), the chevron
 * moved to the trailing edge next to a persistent "Разбор" label (not
 * hover-only — visible before any interaction, matches the convention
 * already used by <PsychTestHeaderInfo>), and the detail panel expands
 * in-place directly under the row instead of appending at section end.
 *
 * Interactive vs. static is decided by whether the caller passes `onToggle`
 * — NOT by whether `children` happens to be truthy on this render. A row
 * whose `children` is itself derived from `isOpen`'s own selection state
 * (e.g. `{activeItem && <PsychDetailCard/>}` where `activeItem` comes from
 * the same "selected key" the row toggles) evaluates to `null` the instant
 * the row closes — checking `children` there used to permanently strip the
 * button off a closed row, with no way left to reopen it (real bug, filed
 * against the "Тип темперамента" and "Уровень притязаний" rows).
 */
export function ScoreRow({ label, value, badge, isOpen = false, onToggle, children, className }: ScoreRowProps) {
  if (!onToggle) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-[12px] border border-default/70 px-3.5 py-2.5',
          className,
        )}
      >
        <span className="min-w-0">{label}</span>
        <span className="flex items-center gap-2 flex-shrink-0">
          {value}
          {badge}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[12px] border overflow-hidden transition-colors',
        isOpen ? 'border-brand/40' : 'border-default/70',
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-brand',
          isOpen ? 'bg-brand-subtle/60' : 'hover:bg-raised/70',
        )}
      >
        <span className="min-w-0">{label}</span>
        <span className="flex items-center gap-2.5 flex-shrink-0">
          {value}
          {badge}
          <span className={cn(ADMIN_META, 'hidden sm:inline', isOpen && 'text-brand font-medium')}>
            {isOpen ? 'Свернуть' : 'Разбор'}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-muted transition-transform flex-shrink-0', isOpen && 'rotate-180 text-brand')}
          />
        </span>
      </button>

      {isOpen && <div className="border-t border-default/60 p-3">{children}</div>}
    </div>
  );
}
