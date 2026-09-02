import { Lock } from 'lucide-react';
import { Tooltip } from '@/shared/ui/Tooltip';

/**
 * Shown next to a field label when the field is in `admin_locked_fields`
 * (docs/admin-university-editing-api.md §7) — protects a manual edit from
 * being silently overwritten by the next seed/backfill redeploy. Purely
 * informational: there is no unlock endpoint, and the field stays editable
 * through this same form regardless of lock state.
 */
export function LockedFieldBadge() {
  return (
    <Tooltip content="Защищено от автоматического обновления при следующем деплое">
      <span tabIndex={0} className="inline-flex text-brand">
        <Lock size={12} />
      </span>
    </Tooltip>
  );
}
