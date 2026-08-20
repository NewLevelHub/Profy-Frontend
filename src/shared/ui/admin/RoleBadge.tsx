import { ShieldCheck, Eye } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { AdminRole } from '@/shared/types';
import { ADMIN_ROLE_DESCRIPTIONS, ADMIN_ROLE_LABELS } from '@/shared/lib/adminRole';
import { Tooltip } from '@/shared/ui/Tooltip';

interface RoleBadgeProps {
  role: AdminRole;
  className?: string;
}

/**
 * Always-visible role indicator for the admin chrome. Administrator and
 * Operator get distinct colors/icons so the role reads at a glance, not just
 * from which actions happen to be clickable.
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  const isAdministrator = role === 'administrator';

  return (
    <Tooltip content={ADMIN_ROLE_DESCRIPTIONS[role]}>
      <span
        tabIndex={0}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill font-mono text-mono-xs font-extrabold uppercase tracking-label leading-tight',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[color-mix(in_srgb,var(--brand)_40%,transparent)]',
          isAdministrator ? 'bg-brand-subtle text-brand' : 'bg-warning-subtle text-warning',
          className,
        )}
      >
        {isAdministrator ? <ShieldCheck size={13} /> : <Eye size={13} />}
        {ADMIN_ROLE_LABELS[role]}
      </span>
    </Tooltip>
  );
}
