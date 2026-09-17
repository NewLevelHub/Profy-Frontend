import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const COLUMNS: AdminColumn<PsychologistStudentListItem>[] = [
  {
    key: 'name',
    header: 'Ученик',
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
    header: 'Email',
    mobile: 'subtitle',
    cell: (row) => (
      <span className={cn(ADMIN_TEXT, 'font-mono text-mono-sm text-secondary')}>{row.email}</span>
    ),
  },
  {
    key: 'age',
    header: 'Возраст',
    mobile: 'badge',
    cell: (row) =>
      row.age_group ? (
        <AdminBadge tone="quiet">{AGE_TIER_LABELS[row.age_group as AgeGroup] ?? row.age_group}</AdminBadge>
      ) : (
        <span className={ADMIN_META}>—</span>
      ),
  },
  {
    key: 'registered',
    header: 'Регистрация',
    mobile: 'field',
    mobileLabel: 'Регистрация',
    cell: (row) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(row.registered_at)}</span>,
  },
];

export default function PsychologistStudentsPage() {
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
        if (!cancelled) setError('Не удалось загрузить список учеников');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminListHeader
        title="Ученики"
        description="Все ученики платформы. Карточка, отчёт и заметки — по клику на имя."
      />

      {error && <AdminError message={error} onRetry={() => window.location.reload()} />}

      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : items.length === 0 ? (
        <div className={cn('border border-default bg-surface px-5 py-10 text-center', ADMIN_RADIUS)}>
          <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>
            Пока нет учеников
          </p>
          <p className={cn(ADMIN_META, 'mt-2 m-0')}>
            Здесь появятся все зарегистрированные ученики платформы.
          </p>
        </div>
      ) : (
        <AdminDataTable
          label="Ученики"
          columns={COLUMNS}
          rows={items}
          rowKey={(row) => row.id}
          rowHref={(row) => `/psychologist/students/${row.id}`}
        />
      )}
    </PageContainer>
  );
}
