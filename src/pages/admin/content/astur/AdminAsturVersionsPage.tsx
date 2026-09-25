import { Link } from 'react-router';
import { BarChart3, FilePenLine } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminPageHeader } from '@/shared/ui/admin/AdminBreadcrumbs';
import { AdminCard } from '@/shared/ui/admin/AdminSectionHeading';
import { AdminError, AdminLoading } from '@/shared/ui/admin/AdminStates';
import { ADMIN_BUTTON, ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { asturVersionPath, useAsturVersions } from './hooks/useAsturVersions';

const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('ru-RU') : '—');

/** АСТУР bank: the open draft (if any) and the history of published,
 *  immutable versions — each with its item analytics. */
export default function AdminAsturVersionsPage() {
  const { draft, published, isLoading, isError, refetch, openDraft, opening, openError } = useAsturVersions();

  if (isError) return <AdminError message="Не удалось загрузить версии банка АСТУР." onRetry={() => refetch()} />;
  if (isLoading) return <AdminLoading label="Загрузка версий…" />;

  return (
    <>
      <AdminPageHeader
        crumbs={[{ label: 'АСТУР — версии банка' }]}
        title="АСТУР (когнитивные навыки)"
        meta={
          <p className={cn(ADMIN_META, 'm-0')}>
            Вопросы, варианты и ключи публикуются вместе, одной неизменяемой версией. Каждая попытка ученика
            навсегда привязана к версии, которую он видел.
          </p>
        }
      />

      <AdminCard
        title="Черновик"
        description={
          draft
            ? `Изменён ${formatDate(draft.updated_at)} · ${draft.item_count} заданий`
            : 'Изменения вносятся в черновик на основе последней опубликованной версии.'
        }
        aside={
          <Button variant="primary" size="sm" onClick={openDraft} disabled={opening} className="gap-2">
            <FilePenLine size={14} aria-hidden="true" />
            {draft ? 'Открыть черновик' : 'Создать черновик'}
          </Button>
        }
      >
        {draft?.notes && <p className={cn(ADMIN_TEXT, 'text-secondary m-0')}>{draft.notes}</p>}
        {openError && <p className={cn(ADMIN_META, 'text-danger m-0')}>{openError}</p>}
      </AdminCard>

      <AdminCard title="Опубликованные версии" description="Не редактируются — изменение создаёт следующую версию.">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={cn(ADMIN_META, 'text-left')}>
                <th className="py-2 pr-3 font-medium">Версия</th>
                <th className="py-2 pr-3 font-medium">Опубликована</th>
                <th className="py-2 pr-3 font-medium">Заданий</th>
                <th className="py-2 pr-3 font-medium">Попыток</th>
                <th className="py-2 pr-3 font-medium">Комментарий</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {published.map((version, i) => (
                <tr key={version.id} className="border-t border-default">
                  <td className="py-2.5 pr-3">
                    <span className={cn(ADMIN_NUM, 'mr-2')}>v{version.version}</span>
                    {i === 0 && <AdminBadge tone="brand">текущая</AdminBadge>}
                  </td>
                  <td className={cn(ADMIN_TEXT, 'py-2.5 pr-3')}>{formatDate(version.published_at)}</td>
                  <td className={cn(ADMIN_NUM, 'py-2.5 pr-3')}>{version.item_count}</td>
                  <td className={cn(ADMIN_NUM, 'py-2.5 pr-3')}>{version.attempt_count}</td>
                  <td className={cn(ADMIN_META, 'py-2.5 pr-3 max-w-[280px]')}>{version.notes ?? '—'}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-2">
                      <Link className={ADMIN_BUTTON} to={asturVersionPath(version.id)}>
                        Открыть
                      </Link>
                      <Link className={ADMIN_BUTTON} to={`${asturVersionPath(version.id)}/analytics`}>
                        <BarChart3 size={14} aria-hidden="true" />
                        Аналитика
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
