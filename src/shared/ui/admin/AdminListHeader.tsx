import type { ReactNode } from 'react';
import { PageHeader } from '@/shared/ui/PageHeader';

interface AdminListHeaderProps {
  title: string;
  /** One line naming what this list actually contains and where it comes from. */
  description?: ReactNode;
  actions?: ReactNode;
}

/**
 * Page header for admin list screens — same display title + subtitle rhythm as
 * Universities / Results (`PageHeader`). The "Админка" kicker lives on the
 * side rail (like Profile's identity column), so it isn't repeated here.
 */
export function AdminListHeader({ title, description, actions }: AdminListHeaderProps) {
  return (
    <PageHeader
      title={title}
      subtitle={description}
      actions={actions}
    />
  );
}
