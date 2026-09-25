import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { psychologistApi } from '@/shared/api/psychologist';
import { cn } from '@/shared/lib/cn';
import { ASSESSMENT_GOAL_LABELS } from '@/shared/lib/assessmentLabels';
import { AgeBadge } from '@/shared/ui/admin/AgeBadge';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError, AdminTableSkeleton } from '@/shared/ui/admin/AdminStates';
import { ADMIN_META, ADMIN_NUM, ADMIN_RADIUS, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { PageContainer } from '@/shared/ui/PageContainer';
import type { AgeGroup, PsychologistReviewQueueItem } from '@/shared/types';

// ASSESSMENT_GOAL_LABELS holds i18n keys (admin namespace) since the admin
// panel was localized — render them through t(), never as-is.
function GoalLabel({ goal }: { goal: PsychologistReviewQueueItem['goal'] }) {
  const { t } = useTranslation();
  return <span className={cn(ADMIN_TEXT, 'text-secondary')}>{t(ASSESSMENT_GOAL_LABELS[goal] ?? goal)}</span>;
}

function reviewPath(row: PsychologistReviewQueueItem) {
  return `/psychologist/students/${row.student_id}/assessments/${row.assessment_id}/report?tab=review`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const COLUMNS: AdminColumn<PsychologistReviewQueueItem>[] = [
  {
    key: 'name',
    header: 'Ученик',
    mobile: 'title',
    grow: true,
    cell: (row) => {
      const named = Boolean(row.student_name);
      return (
        <Link
          to={reviewPath(row)}
          className={cn(
            ADMIN_TEXT,
            'font-semibold text-primary hover:text-brand hover:underline truncate',
            !named && 'font-mono text-mono-sm',
          )}
        >
          {named ? row.student_name : row.student_email}
        </Link>
      );
    },
  },
  {
    key: 'email',
    header: 'Email',
    mobile: 'subtitle',
    cell: (row) => (
      <span className={cn(ADMIN_TEXT, 'font-mono text-mono-sm text-secondary')}>{row.student_email}</span>
    ),
  },
  {
    key: 'goal',
    header: 'Цель',
    mobile: 'field',
    mobileLabel: 'Цель',
    cell: (row) => (
      <GoalLabel goal={row.goal} />
    ),
  },
  {
    key: 'age',
    header: 'Ступень',
    mobile: 'badge',
    cell: (row) => <AgeBadge age={row.age} />,
  },
  {
    key: 'generated',
    header: 'Сформирован',
    mobile: 'field',
    mobileLabel: 'Сформирован',
    cell: (row) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(row.generated_at)}</span>,
  },
  {
    key: 'state',
    header: 'Правки',
    mobile: 'field',
    mobileLabel: 'Правки',
    cell: (row) =>
      row.reviewed_at ? (
        <AdminBadge tone="accent">Есть правки</AdminBadge>
      ) : (
        <AdminBadge tone="quiet">Не открывался</AdminBadge>
      ),
  },
];

export default function PsychologistReviewQueuePage() {
  const [items, setItems] = useState<PsychologistReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rows = await psychologistApi.listReviews();
        if (!cancelled) setItems(rows);
      } catch {
        if (!cancelled) setError('Не удалось загрузить отчёты на проверке');
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
        title="Проверка отчётов"
        description="Отчёты ваших учеников, которые ещё не опубликованы. Ученик увидит результат только после публикации."
      />

      {error && <AdminError message={error} onRetry={() => window.location.reload()} />}

      {loading ? (
        <AdminTableSkeleton rows={4} columns={6} />
      ) : items.length === 0 ? (
        <div className={cn('border border-default bg-surface px-5 py-10 text-center', ADMIN_RADIUS)}>
          <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>Все отчёты проверены</p>
          <p className={cn(ADMIN_META, 'mt-2 m-0')}>
            Когда назначенный вам ученик завершит тест, его отчёт появится здесь.
          </p>
        </div>
      ) : (
        <AdminDataTable
          label="Отчёты на проверке"
          columns={COLUMNS}
          rows={items}
          rowKey={(row) => row.assessment_id}
          rowHref={reviewPath}
        />
      )}
    </PageContainer>
  );
}
