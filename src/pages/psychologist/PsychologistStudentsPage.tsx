import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
import { Button } from '@/shared/ui/Button';
import { PageContainer } from '@/shared/ui/PageContainer';
import type {
  AgeGroup,
  PsychologistAvailableStudentItem,
  PsychologistStudentListItem,
} from '@/shared/types';

type Tab = 'mine' | 'available';

function formatAssignedAt(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const MINE_COLUMNS: AdminColumn<PsychologistStudentListItem>[] = [
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
    key: 'assigned',
    header: 'Взят',
    mobile: 'field',
    mobileLabel: 'Взят',
    cell: (row) => <span className={cn(ADMIN_NUM, 'text-muted')}>{formatAssignedAt(row.assigned_at)}</span>,
  },
];

export default function PsychologistStudentsPage() {
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
      setError('Не удалось загрузить список учеников');
    } finally {
      setLoading(false);
    }
  }, []);

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
      setError('Не удалось взять ученика — попробуйте ещё раз');
      setClaimingId(null);
    }
  }

  const availableColumns: AdminColumn<PsychologistAvailableStudentItem>[] = [
    {
      key: 'name',
      header: 'Ученик',
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
      key: 'pending',
      header: 'Отчёт',
      mobile: 'field',
      mobileLabel: 'Отчёт',
      cell: (row) =>
        row.has_pending_review ? (
          <AdminBadge tone="accent">ждёт проверки</AdminBadge>
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
          {claimingId === row.id ? '…' : 'Взять'}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer className="flex flex-col gap-5 pb-10">
      <AdminListHeader
        title="Ученики"
        description="Вы сами выбираете учеников — администратор в этом флоу не участвует."
      />

      <div className="flex gap-2" role="tablist" aria-label="Список учеников">
        <TabButton active={tab === 'mine'} onClick={() => setTab('mine')}>
          Мои ({mine.length})
        </TabButton>
        <TabButton active={tab === 'available'} onClick={() => setTab('available')}>
          Доступные ({available.length})
        </TabButton>
      </div>

      {error && <AdminError message={error} onRetry={() => void load()} />}

      {loading ? (
        <AdminTableSkeleton rows={5} columns={4} />
      ) : tab === 'mine' ? (
        mine.length === 0 ? (
          <EmptyState
            title="Пока нет ваших учеников"
            body="Откройте вкладку «Доступные» и нажмите «Взять» — ученик появится здесь."
          />
        ) : (
          <AdminDataTable
            label="Мои ученики"
            columns={MINE_COLUMNS}
            rows={mine}
            rowKey={(row) => row.id}
            rowHref={(row) => `/psychologist/students/${row.id}`}
          />
        )
      ) : available.length === 0 ? (
        <EmptyState
          title="Нет доступных учеников"
          body="Все ученики уже у вас, либо в системе пока никого нет."
        />
      ) : (
        <AdminDataTable
          label="Доступные ученики"
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
