import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { MONO_LABEL } from '@/shared/ui/admin/density';

/**
 * Marks a field that an admin has already edited, and which is therefore
 * excluded from the automated seed/backfill re-sync on every deploy
 * (`admin_locked_fields` for universities/programs, the `overrides` dict for
 * question-bank content).
 *
 * The wording matters and was wrong before PRO-242: a padlock next to a field
 * label reads as "read-only", but the field is fully editable — the lock is
 * about who owns the value going forward, not about permission. Copy now says
 * that, and the label is visible text rather than an icon whose meaning lives
 * only in a tooltip.
 */
export function LockedFieldBadge({ reason }: { reason?: string }) {
  return (
    <Tooltip
      content={
        reason ??
        'Значение задано вручную. Автообновление контента при деплое его не перезапишет.'
      }
    >
      <span
        tabIndex={0}
        className={cn(
          MONO_LABEL,
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-brand-subtle text-brand',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        )}
      >
        <Lock size={10} />
        Вручную
      </span>
    </Tooltip>
  );
}
