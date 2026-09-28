import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { formatDate as formatLocaleDate } from '@/shared/i18n/format';
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
  return formatLocaleDate(value, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const columns = (t: TFunction<'psychologist'>): AdminColumn<PsychologistReviewQueueItem>[] => [
  {
    key: 'name',
    header: t('list.colStudent'),
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
    header: t('list.colEmail'),
    mobile: 'subtitle',
    cell: (row) => (
      <span className={cn(ADMIN_TEXT, 'font-mono text-mono-sm text-secondary')}>{row.student_email}</span>
    ),
  },
  {
    key: 'goal',
    header: t('queue.colGoal'),
    mobile: 'field',
    mobileLabel: t('queue.colGoal'),
    cell: (row) => (
      <GoalLabel goal={row.goal} />
    ),
  },
  {
    key: 'age',
    header: t('list.colAge'),
    mobile: 'badge',
    cell: (row) => <AgeBadge age={row.age} />,
  },
  {
    key: 'generated',
    header: t('queue.colGenerated'),
    mobile: 'field',
    mobileLabel: t('queue.colGenerated'),
    cell: (row) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatDate(row.generated_at)}</span>,
  },
  {
    key: 'state',
    header: t('queue.colEdits'),
    mobile: 'field',
    mobileLabel: t('queue.colEdits'),
    cell: (row) =>
      row.reviewed_at ? (
        <AdminBadge tone="accent">{t('queue.hasEdits')}</AdminBadge>
      ) : (
        <AdminBadge tone="quiet">{t('queue.notOpened')}</AdminBadge>
      ),
  },
];

export default function PsychologistReviewQueuePage() {
  const { t } = useTranslation('psychologist');
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
        if (!cancelled) setError(t('queue.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminListHeader
        title={t('queue.title')}
        description={t('queue.description')}
      />

      {error && <AdminError message={error} onRetry={() => window.location.reload()} />}

      {loading ? (
        <AdminTableSkeleton rows={4} columns={6} />
      ) : items.length === 0 ? (
        <div className={cn('border border-default bg-surface px-5 py-10 text-center', ADMIN_RADIUS)}>
          <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{t('queue.emptyTitle')}</p>
          <p className={cn(ADMIN_META, 'mt-2 m-0')}>
            {t('queue.emptyHint')}
          </p>
        </div>
      ) : (
        <AdminDataTable
          label={t('queue.tableLabel')}
          columns={columns(t)}
          rows={items}
          rowKey={(row) => row.assessment_id}
          rowHref={reviewPath}
        />
      )}
    </PageContainer>
  );
}
