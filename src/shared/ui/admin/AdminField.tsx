import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { MONO_LABEL } from '@/shared/ui/admin/density';
import { LockedFieldBadge } from '@/shared/ui/admin/LockedFieldBadge';

interface AdminFieldProps {
  label: string;
  locked?: boolean;
  lockReason?: string;
  className?: string;
  children: ReactNode;
}

/** Label row (+ optional lock badge) above a form control, at admin density. */
export function AdminField({ label, locked, lockReason, className, children }: AdminFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn(MONO_LABEL, 'text-muted')}>{label}</span>
        {locked && <LockedFieldBadge reason={lockReason} />}
      </div>
      {children}
    </div>
  );
}
