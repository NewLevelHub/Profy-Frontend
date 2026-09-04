import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';

interface AdminListHeaderProps {
  title: string;
  /** One line naming what this list actually contains and where it comes from. */
  description?: ReactNode;
  actions?: ReactNode;
}

/**
 * Page header for admin list screens.
 *
 * Every list now has one — before PRO-242 the questions list was the only
 * screen with no heading at all (it opened on a bare "314 ВСЕГО"), while its
 * sibling content lists each had one.
 */
export function AdminListHeader({ title, description, actions }: AdminListHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="font-display text-display-sm font-semibold text-primary m-0">{title}</h1>
        {description && (
          <p className={cn(ADMIN_TEXT, 'text-muted mt-1 max-w-[70ch]')}>{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
