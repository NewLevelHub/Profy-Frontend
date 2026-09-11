import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { ADMIN_TEXT } from '@/shared/ui/admin/density';

export interface Crumb {
  label: string;
  /** Omitted on the last crumb — the page you're already on. */
  to?: string;
}

interface AdminPageHeaderProps {
  crumbs: readonly Crumb[];
  title: ReactNode;
  /** Machine meta under the title: slug, instrument, id fragment. */
  meta?: ReactNode;
  /** Page-level actions — export, external link. */
  actions?: ReactNode;
}

/**
 * Header for admin detail screens: breadcrumbs, title, meta, actions.
 *
 * Replaces the per-page "← Назад" button, which hardcoded a single destination
 * and lied when the path in was different — on the program screen it pointed at
 * the university card, not at wherever you came from. Breadcrumbs describe the
 * hierarchy honestly and stay useful when a detail URL is opened cold from a
 * bookmark or a shared link.
 */
export function AdminPageHeader({ crumbs, title, meta, actions }: AdminPageHeaderProps) {
  const { t } = useTranslation('admin');
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <nav aria-label={t('breadcrumbs.aria')} className="flex items-center gap-1 flex-wrap mb-1.5">
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight size={11} className="text-muted flex-shrink-0" aria-hidden="true" />}
              {/* Sentence case: a crumb can carry a person's name, and
                  "АРМАН" set in tracked uppercase reads as a system constant
                  rather than as who this page is about. */}
              {crumb.to ? (
                <Link to={crumb.to} className={cn(ADMIN_TEXT, 'text-muted hover:text-brand transition-colors')}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn(ADMIN_TEXT, 'text-secondary truncate max-w-[32ch]')} aria-current="page">
                  {crumb.label}
                </span>
              )}
            </Fragment>
          ))}
        </nav>

        <h1 className="font-display text-display-sm font-semibold text-primary text-balance m-0">{title}</h1>
        {meta && <div className="mt-1.5">{meta}</div>}
      </div>

      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
