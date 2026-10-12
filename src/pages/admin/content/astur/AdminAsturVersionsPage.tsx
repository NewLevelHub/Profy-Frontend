import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { formatDate as formatLocaleDate } from '@/shared/i18n/format';
import { BarChart3, FilePenLine } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { asturVersionPath, useAsturVersions } from './hooks/useAsturVersions';

const formatDate = (iso: string | null) => (iso ? formatLocaleDate(iso, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

/** АСТУР bank: the open draft (if any) and the history of published,
 *  immutable versions — each with its item analytics. */
export default function AdminAsturVersionsPage() {
  const { t } = useTranslation('admin');
  const { draft, published, isLoading, isError, refetch, openDraft, opening, openError } = useAsturVersions();

  if (isError) return <AdminError message={t('astur.versions.loadError')} onRetry={() => refetch()} />;
  if (isLoading) return <AdminLoading label={t('astur.versions.loading')} />;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: t('astur.versions.crumb') }]}
        title={t('astur.title')}
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            {t('astur.versions.meta')}
          </p>
        }
      />

      <AdminCard
        title={t('astur.versions.draft')}
        description={
          draft
            ? t('astur.versions.draftChanged', { date: formatDate(draft.updated_at), count: draft.item_count })
            : t('astur.versions.draftHint')
        }
        aside={
          <Button variant="primary" size="sm" onClick={openDraft} disabled={opening} className="gap-2">
            <FilePenLine size={14} aria-hidden="true" />
            {draft ? t('astur.versions.openDraft') : t('astur.versions.createDraft')}
          </Button>
        }
      >
        {draft?.notes && <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{draft.notes}</p>}
        {openError && <p className={cn(ADMIN_META, 'text-danger m-0')}>{openError}</p>}
      </AdminCard>

      <AdminCard title={t('astur.versions.published')} description={t('astur.versions.publishedHint')}>
        <div className="overflow-x-auto">
          <table className="admin-stacked-table w-full border-collapse">
            <thead>
              <tr className={cn(ADMIN_META, 'text-left')}>
                <th className="py-2 pr-3 font-medium">{t('astur.versions.col.version')}</th>
                <th className="py-2 pr-3 font-medium">{t('astur.versions.col.publishedAt')}</th>
                <th className="py-2 pr-3 font-medium">{t('astur.versions.col.items')}</th>
                <th className="py-2 pr-3 font-medium">{t('astur.versions.col.attempts')}</th>
                <th className="py-2 pr-3 font-medium">{t('astur.versions.col.notes')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {published.map((version, i) => (
                <tr key={version.id} className="border-t border-default">
                  <td data-label={t('astur.versions.col.version')} className="py-2.5 pr-3">
                    <span className={cn(ADMIN_NUM, 'mr-2')}>v{version.version}</span>
                    {i === 0 && <AdminBadge tone="brand">{t('astur.versions.current')}</AdminBadge>}
                  </td>
                  <td data-label={t('astur.versions.col.publishedAt')} className={cn(ADMIN_TEXT, 'py-2.5 pr-3')}>{formatDate(version.published_at)}</td>
                  <td data-label={t('astur.versions.col.items')} className={cn(ADMIN_NUM, 'py-2.5 pr-3')}>{version.item_count}</td>
                  <td data-label={t('astur.versions.col.attempts')} className={cn(ADMIN_NUM, 'py-2.5 pr-3')}>{version.attempt_count}</td>
                  <td data-label={t('astur.versions.col.notes')} className={cn(ADMIN_META, 'admin-table-wide py-2.5 pr-3 max-w-[280px]')}>{version.notes ?? '—'}</td>
                  <td className="admin-table-actions py-2.5">
                    <div className="flex justify-end gap-2">
                      <Link className={ADMIN_BUTTON} to={asturVersionPath(version.id)}>
                        {t('astur.versions.open')}
                      </Link>
                      <Link className={ADMIN_BUTTON} to={`${asturVersionPath(version.id)}/analytics`}>
                        <BarChart3 size={14} aria-hidden="true" />
                        {t('astur.versions.analytics')}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}
