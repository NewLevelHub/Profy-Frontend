import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Download, FileText, UserPlus } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { downloadCsv } from '@/shared/lib/downloadBlob';
import { printWithTitle } from '@/shared/lib/printDocument';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import { USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AgeBadge } from '@/shared/ui/admin/AgeBadge';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { UsersPrintReport } from './components/UsersPrintReport';
import { CreateStaffModal } from './components/CreateStaffModal';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserStats,
  AssessmentGoal,
  AssessmentStatus,
  UserRole,
} from '@/shared/types';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';

const PAGE_SIZE = 20;
/** `role`/`inactive_days` live in the URL with the other filters, but Clear
 *  keeps the active role tab — see `clearListFilters`. */
const FILTER_KEYS = ['search', 'status', 'goal', 'role', 'inactive_days'] as const;
/** Поля сортировки, которые принимает эндпоинт — незнакомое значение
 *  в URL игнорируется, а не улетает на сервер за 422. */
const SORTABLE_KEYS = ['created_at', 'last_active_at', 'email', 'latest_assessment_status'] as const;

const ROLE_TABS: readonly UserRole[] = ['student', 'psychologist', 'admin'];

function parseRole(value: string): UserRole {
  return value === 'admin' || value === 'psychologist' || value === 'student' ? value : 'student';
}

/** Порог «давно не заходил». Регистрация считается активностью, поэтому
 *  свежий аккаунт под фильтр не попадает. */
const INACTIVE_OPTIONS = [
  { value: '7', labelKey: 'users.inactiveOptions.week' },
  { value: '30', labelKey: 'users.inactiveOptions.month' },
  { value: '90', labelKey: 'users.inactiveOptions.quarter' },
] as const;

/** Эндпоинта list потолок — `limit: le=100`. */
const PRINT_PAGE_LIMIT = 100;
/** См. `handlePrint`: ниже серверных 5000, потому что это бумага. */
const PRINT_MAX_ROWS = 1000;

/** RIASEC letters, named. The list shows the two strongest by score. */
const RIASEC_LABELS: Record<string, string> = {
  R: 'admin:riasecShort.R',
  I: 'admin:riasecShort.I',
  A: 'admin:riasecShort.A',
  S: 'admin:riasecShort.S',
  E: 'admin:riasecShort.E',
  C: 'admin:riasecShort.C',
};

/**
 * The two leading interest types, as words.
 *
 * The original cell printed all six as "I56 A55 E64 R62 S69 C59" — 24
 * characters of undecoded letter/number pairs in the widest column of the
 * table. A list answers "roughly who is this"; the full six-way breakdown with
 * bars already lives on the user's assessment panel.
 */
function InterestsCell({ values }: { values: Record<string, number> | null }) {
  const { t } = useTranslation('admin');
  if (!values) {
    return <span className={ADMIN_META} title={t('users.interestsEmptyHint')}>—</span>;
  }

  const ranked = Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  if (ranked.length === 0) return <span className={ADMIN_META}>—</span>;

  return (
    <span className="flex flex-col gap-0.5">
      {ranked.map(([letter, value], index) => (
        <span
          key={letter}
          className={cn(
            'flex items-baseline gap-1.5 whitespace-nowrap',
            index === 0 ? 'text-primary' : 'text-muted',
          )}
        >
          <span>{t(RIASEC_LABELS[letter] ?? letter)}</span>
          <span className={cn(ADMIN_NUM, 'text-muted text-mono-xs')}>{Math.round(value)}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * `latest_assessment_status` only distinguishes in_progress / completed, so
 * only those two states plus "not started" are drawn — there is no per-row
 * progress or drop-off signal in the list response.
 *
 * All three share one chip shape. Previously "Завершена" was a tinted pill and
 * "Не начата" was bare uppercase text, so one column looked like two.
 */
function DiagnosticsCell({ status }: { status: AssessmentStatus | null }) {
  const { t } = useTranslation('admin');
  if (!status) {
    return (
      <AdminBadge tone="quiet" title={t('users.notStartedHint')}>
        {t('users.status.notStarted')}
      </AdminBadge>
    );
  }

  return status === 'in_progress' ? (
    <AdminBadge tone="accent" dot>
      {t('status.in_progress')}
    </AdminBadge>
  ) : (
    <AdminBadge tone="neutral" dot>
      {t('users.status.done')}
    </AdminBadge>
  );
}

function formatRelative(value: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const date = new Date(value);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays < 1) return t('users.today');
  if (diffDays === 1) return t('users.yesterday');
  if (diffDays < 30) return t('users.daysAgo', { count: diffDays });
  return formatIntlDate(date, { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function AdminUsersPage() {
  const { t } = useTranslation('admin');
  const { page, values, sort, setSort, setFilter, setFilters, setPage } = useAdminListParams(
    FILTER_KEYS,
    SORTABLE_KEYS,
  );
  // So the breadcrumb on a user's card returns to this exact filtered page.
  useRememberListQuery('/admin/users');
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printRows, setPrintRows] = useState<{
    items: AdminUserListItem[];
    total: number;
    truncated: boolean;
  } | null>(null);
  const [exportError, setExportError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<AdminUserDetail | null>(null);
  const [stats, setStats] = useState<AdminUserStats | null>(null);

  const {
    search,
    status,
    goal,
    role: roleRaw,
    inactive_days: inactiveDays,
  } = values;
  const role = parseRole(roleRaw);
  const isStudentRole = role === 'student';

  /**
   * Shared slice for list / CSV / PDF — assessment filters only apply to
   * students, but `inactive_days` is about login activity, not diagnostics,
   * so it stays available on every role tab.
   */
  const listFilters = useMemo(
    () => ({
      search: search || undefined,
      role,
      inactive_days: inactiveDays ? Number(inactiveDays) : undefined,
      ...(isStudentRole
        ? {
            status: (status as AssessmentStatus) || undefined,
            goal: (goal as AssessmentGoal) || undefined,
          }
        : {}),
    }),
    [search, role, isStudentRole, status, goal, inactiveDays],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUsers({
          ...listFilters,
          page,
          limit: PAGE_SIZE,
          sort: sort?.key,
          order: sort?.order,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError(t('users.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, listFilters, sort?.key, sort?.order, reloadToken, t]);

  // Whole-table counts, independent of the filters: they answer "what is
  // happening overall", which is the question a filtered page cannot.
  useEffect(() => {
    let cancelled = false;
    adminApi
      .getUserStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        // Tiles are context, not the content — their absence must not take the
        // table down with them.
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const handleRoleChange = useCallback(
    (next: UserRole) => {
      // Switching role clears assessment filters (they're meaningless for staff)
      // and drops `role` from the URL when back on the default student tab.
      setFilters({
        role: next === 'student' ? '' : next,
        status: '',
        goal: '',
      });
    },
    [setFilters],
  );

  const clearListFilters = useCallback(() => {
    // Keep the active role tab — Clear is for search/assessment/activity filters only.
    setFilters({ search: '', status: '', goal: '', inactive_days: '' });
  }, [setFilters]);

  /**
   * PDF собирается по всему срезу, а не по видимой странице.
   *
   * CSV с бэкенда игнорирует пагинацию и отдаёт всё, что подошло под фильтры
   * (`export_users`, потолок 5000 строк). PDF рядом с ним, печатающий только
   * двадцать строк первой страницы, назывался бы «выгрузкой», ею не являясь.
   * Поэтому список дочитывается страницами по 100 — тем же эндпоинтом и с теми
   * же фильтрами, что и таблица.
   *
   * Потолок ниже серверного (5000): это лист бумаги. Тысяча строк — это уже
   * ~25 страниц A4, дальше PDF перестаёт быть форматом для чтения, и правильный
   * ответ — CSV. При обрыве лист сам пишет, что на нём не весь срез.
   */
  async function handlePrint() {
    setPrinting(true);
    setExportError('');
    try {
      const first = await adminApi.listUsers({ ...listFilters, page: 1, limit: PRINT_PAGE_LIMIT });
      const reachable = Math.min(first.total, PRINT_MAX_ROWS);
      const pageCount = Math.ceil(reachable / PRINT_PAGE_LIMIT);
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
          adminApi.listUsers({ ...listFilters, page: i + 2, limit: PRINT_PAGE_LIMIT }),
        ),
      );
      const rows = [...first.items, ...rest.flatMap((r) => r.items)].slice(0, PRINT_MAX_ROWS);
      setPrintRows({ items: rows, total: first.total, truncated: first.total > PRINT_MAX_ROWS });
    } catch {
      setExportError(t('users.pdfError'));
      setPrinting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportError('');
    try {
      const blob = await adminApi.exportUsers(listFilters);
      downloadCsv(blob, `users_${role}_export.csv`);
    } catch {
      setExportError(t('users.csvError'));
    } finally {
      setExporting(false);
    }
  }

  // Печать запускается отдельным эффектом: разметку листа надо сначала
  // смонтировать, и только потом звать window.print().
  useEffect(() => {
    if (!printRows) return;
    let cancelled = false;
    void printWithTitle('profy_users').then(() => {
      if (cancelled) return;
      setPrintRows(null);
      setPrinting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [printRows]);

  /** Активные фильтры человеческим языком — печатаются в шапке листа. */
  const activeFilterLabels = [
    t(`users.roleTabs.${role}`),
    search ? t('users.filterEmail', { search }) : null,
    isStudentRole && status
      ? t('users.filterStatus', { status: t(ASSESSMENT_STATUS_LABELS[status as AssessmentStatus]) })
      : null,
    isStudentRole && goal
      ? t('users.filterGoal', { goal: t(ASSESSMENT_GOAL_LABELS[goal as AssessmentGoal]) })
      : null,
    inactiveDays ? t('users.filterInactiveDays', { days: inactiveDays }) : null,
  ].filter((value): value is string => value !== null);

  const userColumn: AdminColumn<AdminUserListItem> = {
    key: 'user',
    header: t('feedback.col.user'),
    mobile: 'title',
    // Name and email in one cell. They were two columns, and since the name
    // falls back to the email when there's no profile, half the rows printed
    // the same address twice, side by side.
    cell: (item) => {
      const named = item.has_profile && item.profile_name;
      return (
        <span className="flex flex-col gap-0.5 min-w-0">
          <Link
            to={`/admin/users/${item.id}`}
            className={cn(
              ADMIN_TEXT,
              'font-semibold text-primary hover:text-brand hover:underline truncate',
              !named && 'font-mono text-mono-sm',
            )}
          >
            {named ? item.profile_name : item.email}
          </Link>
          {named && (
            <span className={cn(ADMIN_NUM, 'text-muted text-mono-xs truncate')}>{item.email}</span>
          )}
        </span>
      );
    },
  };

  const registeredColumn: AdminColumn<AdminUserListItem> = {
    key: 'created',
    // Was "Активность" showing `created_at`, so someone who registered two
    // days ago and never came back read as "active 2 days ago". Real activity
    // now has its own column to the right.
    header: t('users.col.registered'),
    sortKey: 'created_at',
    width: '126px',
    align: 'right',
    mobile: 'field',
    cell: (item) => (
      <span className={cn(ADMIN_NUM, 'text-muted whitespace-nowrap')}>{formatRelative(item.created_at, t)}</span>
    ),
  };

  const activeColumn: AdminColumn<AdminUserListItem> = {
    key: 'active',
    header: t('users.col.active'),
    sortKey: 'last_active_at',
    width: '126px',
    align: 'right',
    mobile: 'field',
    headerTitle: t('users.col.activeHint'),
    cell: (item) =>
      item.last_active_at ? (
        <span className={cn(ADMIN_NUM, 'text-muted whitespace-nowrap')}>
          {formatRelative(item.last_active_at, t)}
        </span>
      ) : (
        // Not an em dash: "never seen" is a fact about the user, and a dash
        // reads as missing data instead.
        <span className={ADMIN_META} title={t('users.neverActiveHint')}>
          {t('users.neverActive')}
        </span>
      ),
  };

  // Assessment columns only make sense for students — staff rows would be a
  // wall of em dashes under age / diagnostics / goal / interests.
  const columns: AdminColumn<AdminUserListItem>[] = isStudentRole
    ? [
        userColumn,
        {
          key: 'age',
          header: t('common.col.age'),
          width: '104px',
          mobile: 'field',
          cell: (item) => <AgeBadge age={item.age} />,
        },
        {
          key: 'diagnostics',
          header: t('users.col.assessment'),
          width: '146px',
          mobile: 'badge',
          cell: (item) => <DiagnosticsCell status={item.latest_assessment_status} />,
        },
        {
          key: 'goal',
          header: t('users.col.goal'),
          width: '176px',
          headerTitle: t('users.col.goalHint'),
          mobile: 'field',
          mobileLabel: t('users.col.goalShort'),
          cell: (item) =>
            item.latest_assessment_goal ? (
              <span className={ADMIN_TEXT}>{t(ASSESSMENT_GOAL_LABELS[item.latest_assessment_goal])}</span>
            ) : (
              <span className={ADMIN_META}>—</span>
            ),
        },
        {
          key: 'interests',
          header: t('users.col.interests'),
          width: '210px',
          headerTitle: t('users.col.interestsHint'),
          mobile: 'field',
          cell: (item) => <InterestsCell values={item.riasec} />,
        },
        registeredColumn,
        activeColumn,
      ]
    : [userColumn, registeredColumn, activeColumn];

  return (
    <>
      <AdminListHeader
        title={t('nav.users')}
        description={t('users.description')}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              muteSound
              isLoading={printing}
              onClick={handlePrint}
              title={t('users.printHint')}
            >
              <FileText size={14} />
              {t('users.exportPdf')}
            </Button>
            <Button variant="ghost" size="sm" muteSound isLoading={exporting} onClick={handleExport}>
              <Download size={14} />
              {t('users.exportCsv')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              muteSound
              onClick={() => {
                setCreatedUser(null);
                setCreateOpen(true);
              }}
            >
              <UserPlus size={14} />
              {t('users.createStaff')}
            </Button>
          </>
        }
      />

      {stats && <UserStatsTiles stats={stats} />}

      {createdUser && (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[3px] border border-brand bg-brand-subtle">
          <p className={cn(ADMIN_TEXT, 'text-brand m-0')}>
            {t('users.createdStaff', {
              email: createdUser.email,
              role: USER_ROLE_LABELS[createdUser.role],
            })}
          </p>
          <Link to={`/admin/users/${createdUser.id}`} className={cn(ADMIN_TEXT, 'text-brand font-semibold underline whitespace-nowrap')}>
            {t('users.createdStaffOpen')}
          </Link>
        </div>
      )}

      <div
        role="group"
        aria-label={t('users.roleTabs.aria')}
        className="inline-flex rounded-[14px] border border-default overflow-hidden self-start"
      >
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleRoleChange(tab)}
            aria-pressed={role === tab}
            className={cn(
              ADMIN_TEXT,
              'px-3 py-1.5 transition-colors border-r border-default last:border-r-0',
              role === tab
                ? 'bg-active-tint text-brand font-medium'
                : 'text-muted hover:text-primary hover:bg-hover',
            )}
          >
            {t(`users.roleTabs.${tab}`)}
          </button>
        ))}
      </div>

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: 'Email' }}
        selects={[
          ...(isStudentRole
            ? [
                {
                  key: 'status',
                  label: t('users.filter.status'),
                  value: status,
                  options: (Object.keys(ASSESSMENT_STATUS_LABELS) as AssessmentStatus[]).map((key) => ({
                    value: key,
                    label: t(ASSESSMENT_STATUS_LABELS[key]),
                  })),
                },
                {
                  key: 'goal',
                  label: t('users.filter.goal'),
                  value: goal,
                  options: (Object.keys(ASSESSMENT_GOAL_LABELS) as AssessmentGoal[]).map((key) => ({
                    value: key,
                    label: t(ASSESSMENT_GOAL_LABELS[key]),
                  })),
                },
              ]
            : []),
          {
            key: 'inactive_days',
            label: t('users.filter.inactiveDays'),
            value: inactiveDays,
            options: INACTIVE_OPTIONS.map((opt) => ({ value: opt.value, label: t(opt.labelKey) })),
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearListFilters}
      />

      {/* The status/goal filters mean "has at least one matching assessment",
          while the goal column always shows the latest one. Said once, in
          place, instead of hidden in a header tooltip. */}
      {isStudentRole && (status || goal) && (
        <p className={cn(ADMIN_META, '-mt-1')}>
          {t('users.filterNote')}
        </p>
      )}

      {error && <AdminError message={error} onRetry={() => setReloadToken((token) => token + 1)} />}
      {exportError && <AdminError message={exportError} />}

      <AdminDataTable
        label={t('nav.users')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/users/${item.id}`}
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        emptyTitle={isStudentRole ? t('users.empty') : t('users.emptyStaff')}
        emptyHint={isStudentRole ? t('users.emptyHint') : t('users.emptyStaffHint')}
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="users" />

      {printRows && (
        <UsersPrintReport
          items={printRows.items}
          total={printRows.total}
          truncated={printRows.truncated}
          filters={activeFilterLabels}
        />
      )}

      <CreateStaffModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(user) => {
          setCreatedUser(user);
          // Jump to the new staff member's role tab so they show up immediately.
          setFilters({
            role: user.role === 'student' ? '' : user.role,
            status: '',
            goal: '',
          });
        }}
      />
    </>
  );
}

/**
 * Что происходит по всей базе, а не на текущей странице.
 *
 * Все четыре числа — срез по всей таблице, поэтому посчитать их на клиенте из
 * страницы в двадцать строк было нельзя: в редизайне на этом месте стояла
 * строка «БРОШЕНО НА ДИАГНОСТИКЕ: НЕТ ДАННЫХ», и её убрали как визуальный
 * мусор. Теперь данные есть.
 *
 * Плашки НЕ следуют за фильтрами таблицы: они отвечают на вопрос «что вообще
 * происходит», а не «что в текущей выборке». Иначе «брошено на диагностике: 0»
 * при фильтре «завершённые» читалось бы как хорошая новость.
 */
function UserStatsTiles({ stats }: { stats: AdminUserStats }) {
  const { t } = useTranslation('admin');
  const tiles = [
    { label: t('users.stats.total'), value: stats.total, hint: undefined },
    { label: t('users.stats.signups7d'), value: stats.signups_last_7d, hint: undefined },
    { label: t('users.stats.completedDiagnostics'), value: stats.completed_diagnostics, hint: undefined },
    {
      label: t('users.stats.abandonedDiagnostics'),
      value: stats.abandoned_diagnostics,
      hint: t('users.stats.abandonedHint', { days: stats.inactive_days_threshold }),
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-surface border border-default rounded-[3px] px-3 py-2.5"
          title={tile.hint}
        >
          <p className="font-mono text-display-sm font-medium text-primary tabular-nums m-0 leading-none">
            {tile.value}
          </p>
          <p className={cn(ADMIN_META, 'mt-1.5')}>{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
