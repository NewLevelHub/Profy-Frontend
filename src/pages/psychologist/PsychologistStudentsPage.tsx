import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import type {
  AgeGroup,
  PsychologistAvailableStudentItem,
  PsychologistStudentListItem,
} from '@/shared/types';

type Tab = 'mine' | 'available';

export default function PsychologistStudentsPage() {
  const { t } = useTranslation(['psychologist', 'admin', 'common']);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<PsychologistStudentListItem[]>([]);
  const [available, setAvailable] = useState<PsychologistAvailableStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mineRows, availableRows] = await Promise.all([
        psychologistApi.listStudents(),
        psychologistApi.listAvailableStudents(),
      ]);
      setMine(mineRows);
      setAvailable(availableRows);
    } catch {
      setError(t('list.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleClaim(studentId: string) {
    if (claimingId) return;
    setClaimingId(studentId);
    setError(null);
    try {
      await psychologistApi.claimStudent(studentId);
      navigate(`/psychologist/students/${studentId}`);
    } catch {
      setError(t('psychologist:list.claimError', 'Не удалось взять ученика — попробуйте ещё раз'));
      setClaimingId(null);
    }
  }

  const mineColumns = useMemo<AdminColumn<PsychologistStudentListItem>[]>(
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
            {row.assigned_at
              ? formatDate(row.assigned_at, { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        ),
      },
    ],
    [t],
  );

  const availableColumns = useMemo<AdminColumn<PsychologistAvailableStudentItem>[]>(
    () => [
      {
        key: 'name',
        header: t('list.colStudent'),
        mobile: 'title',
        grow: true,
        cell: (row) => {
          const named = Boolean(row.profile_name);
          return (
            <span
              className={cn(
                ADMIN_TEXT,
                'font-semibold text-primary truncate',
                !named && 'font-mono text-mono-sm',
              )}
            >
              {named ? row.profile_name : row.email}
            </span>
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
        key: 'pending',
        header: t('psychologist:list.colReport', 'Отчёт'),
        mobile: 'field',
        mobileLabel: t('psychologist:list.colReport', 'Отчёт'),
        cell: (row) =>
          row.has_pending_review ? (
            <AdminBadge tone="accent">{t('psychologist:list.pendingReview', 'ждёт проверки')}</AdminBadge>
          ) : (
            <span className={ADMIN_META}>—</span>
          ),
      },
      {
        key: 'action',
        header: '',
        mobile: 'field',
        cell: (row) => (
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={claimingId === row.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void handleClaim(row.id);
            }}
          >
            {claimingId === row.id ? '…' : t('psychologist:list.claim', 'Взять')}
          </Button>
        ),
      },
    ],
    [claimingId, t],
  );

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminListHeader
        title={t('list.title')}
        description={t('psychologist:list.selfSelectHint', 'Вы сами выбираете учеников — администратор в этом флоу не участвует.')}
      />

      <div className="flex gap-2" role="tablist" aria-label={t('list.title')}>
        <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
          {t('psychologist:list.tabMine', 'Мои')} ({mine.length})
        </TabButton>
        <TabButton active={tab === 'available'} onClick={() => setTab('available')}>
          {t('psychologist:list.tabAvailable', 'Доступные')} ({available.length})
        </TabButton>
      </div>

      {error && <AdminError message={error} onRetry={() => void load()} />}

      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : tab === 'mine' ? (
        mine.length === 0 ? (
          <EmptyState
            title={t('list.emptyTitle')}
            body={t('psychologist:list.emptyMineBody', 'Откройте вкладку «Доступные» и нажмите «Взять» — ученик появится здесь.')}
          />
        ) : (
          <AdminDataTable
            label={t('list.tableLabel')}
            columns={mineColumns}
            rows={mine}
            rowKey={(row) => row.id}
            rowHref={(row) => `/psychologist/students/${row.id}`}
          />
        )
      ) : available.length === 0 ? (
        <EmptyState
          title={t('psychologist:list.emptyAvailableTitle', 'Нет доступных учеников')}
          body={t('psychologist:list.emptyAvailableBody', 'Все ученики уже у вас, либо в системе пока никого нет.')}
        />
      ) : (
        <AdminDataTable
          label={t('psychologist:list.availableStudentsLabel', 'Доступные ученики')}
          columns={availableColumns}
          rows={available}
          rowKey={(row) => row.id}
        />
      )}
    </PageContainer>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-body-sm font-semibold border transition-colors',
        ADMIN_RADIUS,
        active
          ? 'bg-brand text-[color:var(--text-on-brand)] border-transparent'
          : 'bg-surface text-secondary border-default hover:text-primary',
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className={cn('border border-default bg-surface px-5 py-10 text-center', ADMIN_RADIUS)}>
      <p className={cn(ADMIN_TEXT, 'font-semibold text-primary m-0')}>{title}</p>
      <p className={cn(ADMIN_META, 'mt-2 m-0')}>{body}</p>
    </div>
  );
}
