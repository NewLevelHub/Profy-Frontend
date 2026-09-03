import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/Tooltip';
import { MONO_LABEL } from '@/shared/ui/admin/density';

/**
 * List-row marker for `has_overrides: true` (question-bank content —
 * docs/admin-questions-content-overrides-plan.md §3). Unlike university's
 * `admin_locked_fields`, an override here also survives bank-reorg deletion,
 * so the tooltip says both things rather than just "protected from overwrite".
 */
export function OverrideBadge() {
  return (
    <Tooltip content="Отредактировано администратором — защищено от перезаписи и удаления при обновлении контент-банка">
      <span tabIndex={0} className={cn(MONO_LABEL, 'inline-flex items-center gap-1 text-brand')}>
        <Lock size={11} />
        РЕД.
      </span>
    </Tooltip>
  );
}
