import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { MONO_LABEL } from '@/shared/ui/admin/density';

/**
 * List-row marker for `has_overrides: true` — this row carries at least one
 * hand-edited field, so the content-bank re-sync will neither overwrite those
 * fields nor delete the row during a bank reorganisation.
 *
 * Kept distinct from `LockedFieldBadge` (which marks one field inside a form):
 * this one answers "which rows did we touch by hand?" at a glance, the exact
 * question an admin has before a deploy.
 */
export function OverrideBadge() {
  const { t } = useTranslation('admin');
  return (
    <Tooltip content={t('badge.overrideReason')}>
      <span
        tabIndex={0}
        className={cn(
          MONO_LABEL,
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-brand-subtle text-brand',
          'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        )}
      >
        <Lock size={10} />
        {t('badge.manual')}
      </span>
    </Tooltip>
  );
}
