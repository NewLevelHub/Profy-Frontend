import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import { formatDate } from '@/shared/i18n/format';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminTableSkeleton } from '@/shared/ui/admin/AdminStates';
import {
  ADMIN_META,
  ADMIN_NUM,
  ADMIN_RADIUS,
  ADMIN_TEXT,
} from '@/shared/ui/admin/density';
import { PageContainer } from '@/shared/ui/PageContainer';
import type { AgeGroup, PsychologistStudentListItem } from '@/shared/types';

export default function PsychologistStudentsPage() {
  const { t } = useTranslation('psychologist');
  const [items, setItems] = useState<PsychologistStudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await psychologistApi.listStudents();
        if (!cancelled) setItems(rows);
      } catch {
        if (!cancelled) setError(t('list.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const columns = useMemo<AdminColumn<PsychologistStudentListItem>[]>(
    () => [
      {
        key: 'name',
        header: t('list.colStudent'),
        mobile: 'title',
        grow: true,
        cell: (row) => {
          const named = Boolean(row.profile_name);
          return (
            <Link
              to={`/psychologist/students/${row.id}`}
              className={cn(
                ADMIN_TEXT,
                'font-semibold text-primary hover:text-brand hover:underline truncate',
                !named && 'font-mono text-mono-sm',
              )}
            >
              {named ? row.profile_name : row.email}
            </Link>
          );
        },
      },
      {
        key: 'email',
        header: t('list.colEmail'),
        mobile: 'subtitle',
        cell: (row) => (
          <span className={cn(ADMIN_TEXT, 'font-mono text-mono-sm text-secondary')}>{row.email}</span>
        ),
      },
      {
        key: 'age',
        header: t('list.colAge'),
        mobile: 'badge',
        cell: (row) =>
          row.age_group ? (
            <AdminBadge tone="quiet">{AGE_TIER_LABELS[row.age_group as AgeGroup] ?? row.age_group}</AdminBadge>
          ) : (
            <span className={ADMIN_META}>—</span>
          ),
      },
      {
        key: 'assigned',
        header: t('list.colAssigned'),
        mobile: 'field',
        mobileLabel: t('list.colAssigned'),
        cell: (row) => (
          <span className={cn(ADMIN_NUM, 'text-muted')}>
            {formatDate(row.assigned_at, { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminListHeader title={t('list.title')} description={t('list.description')} />

      {error && <AdminError message={error} onRetry={() => window.location.reload()} />}

      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : items.length === 0 ? (
        <div className={cn('border border-default bg-surface px-5 py-10 text-center', ADMIN_RADIUS)}>
          <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{t('list.emptyTitle')}</p>
          <p className={cn(ADMIN_META, 'mt-2 m-0')}>{t('list.emptyHint')}</p>
        </div>
      ) : (
        <AdminDataTable
          label={t('list.tableLabel')}
          columns={columns}
          rows={items}
          rowKey={(row) => row.id}
          rowHref={(row) => `/psychologist/students/${row.id}`}
        />
      )}
    </PageContainer>
  );
}
