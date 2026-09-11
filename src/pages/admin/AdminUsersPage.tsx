import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Download, FileText } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { downloadCsv } from '@/shared/lib/downloadBlob';
import { printWithTitle } from '@/shared/lib/printDocument';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { ASSESSMENT_GOAL_LABELS, ASSESSMENT_STATUS_LABELS } from '@/shared/lib/assessmentLabels';
import { AGE_TIER_LABELS } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { UsersPrintReport } from './components/UsersPrintReport';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminUserListItem, AgeGroup, AssessmentGoal, AssessmentStatus } from '@/shared/types';
import { formatDate as formatIntlDate } from '@/shared/i18n/format';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'age_group', 'status', 'goal'] as const;

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
          <span>{RIASEC_LABELS[letter] ?? letter}</span>
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
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
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

  const { search, age_group: ageGroup, status, goal } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          age_group: (ageGroup as AgeGroup) || undefined,
          status: (status as AssessmentStatus) || undefined,
          goal: (goal as AssessmentGoal) || undefined,
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
  }, [page, search, ageGroup, status, goal, reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

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
      const filters = {
        search: search || undefined,
        age_group: (ageGroup as AgeGroup) || undefined,
        status: (status as AssessmentStatus) || undefined,
        goal: (goal as AssessmentGoal) || undefined,
      };
      const first = await adminApi.listUsers({ ...filters, page: 1, limit: PRINT_PAGE_LIMIT });
      const reachable = Math.min(first.total, PRINT_MAX_ROWS);
      const pageCount = Math.ceil(reachable / PRINT_PAGE_LIMIT);
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
          adminApi.listUsers({ ...filters, page: i + 2, limit: PRINT_PAGE_LIMIT }),
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
      const blob = await adminApi.exportUsers({
        search: search || undefined,
        age_group: (ageGroup as AgeGroup) || undefined,
        status: (status as AssessmentStatus) || undefined,
        goal: (goal as AssessmentGoal) || undefined,
      });
      downloadCsv(blob, 'users_export.csv');
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
    search ? t('users.filterEmail', { search }) : null,
    ageGroup ? t('users.filterAge', { age: AGE_TIER_LABELS[ageGroup as AgeGroup] ?? ageGroup }) : null,
    status ? t('users.filterStatus', { status: t(ASSESSMENT_STATUS_LABELS[status as AssessmentStatus]) }) : null,
    goal ? t('users.filterGoal', { goal: t(ASSESSMENT_GOAL_LABELS[goal as AssessmentGoal]) }) : null,
  ].filter((value): value is string => value !== null);

  const columns: AdminColumn<AdminUserListItem>[] = [
    {
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
            <span className="flex items-center gap-2 min-w-0">
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
              {item.is_admin && (
                <AdminBadge tone="brand" title={t('users.adminHint')}>
                  {t('users.adminBadge')}
                </AdminBadge>
              )}
            </span>
            {named && (
              <span className={cn(ADMIN_NUM, 'text-muted text-mono-xs truncate')}>{item.email}</span>
            )}
          </span>
        );
      },
    },
    {
      key: 'age',
      header: t('common.col.age'),
      width: '104px',
      mobile: 'field',
      cell: (item) =>
        item.age_group ? (
          <span className={ADMIN_TEXT}>{AGE_TIER_LABELS[item.age_group]}</span>
        ) : (
          <span className={ADMIN_META}>—</span>
        ),
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
          <span className={ADMIN_TEXT}>{ASSESSMENT_GOAL_LABELS[item.latest_assessment_goal]}</span>
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
    {
      key: 'created',
      // Was "Активность" showing `created_at`, so someone who registered two
      // days ago and never came back read as "active 2 days ago". There is no
      // last-active field in the API — docs/admin-backend-requests-pro-242.md §5.
      header: t('users.col.registered'),
      width: '126px',
      align: 'right',
      mobile: 'field',
      cell: (item) => (
        <span className={cn(ADMIN_NUM, 'text-muted whitespace-nowrap')}>{formatRelative(item.created_at, t)}</span>
      ),
    },
  ];

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
          </>
        }
      />

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: 'Email' }}
        selects={[
          {
            key: 'age_group',
            label: t('common.col.age'),
            value: ageGroup,
            options: (Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => ({
              value: key,
              label: AGE_TIER_LABELS[key],
            })),
          },
          {
            key: 'status',
            label: t('users.filter.status'),
            value: status,
            options: (Object.keys(ASSESSMENT_STATUS_LABELS) as AssessmentStatus[]).map((key) => ({
              value: key,
              label: ASSESSMENT_STATUS_LABELS[key],
            })),
          },
          {
            key: 'goal',
            label: t('users.filter.goal'),
            value: goal,
            options: (Object.keys(ASSESSMENT_GOAL_LABELS) as AssessmentGoal[]).map((key) => ({
              value: key,
              label: ASSESSMENT_GOAL_LABELS[key],
            })),
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {/* The status/goal filters mean "has at least one matching assessment",
          while the goal column always shows the latest one. Said once, in
          place, instead of hidden in a header tooltip. */}
      {(status || goal) && (
        <p className={cn(ADMIN_META, '-mt-1')}>
          {t('users.filterNote')}
        </p>
      )}

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}
      {exportError && <AdminError message={exportError} />}

      <AdminDataTable
        label={t('nav.users')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/users/${item.id}`}
        loading={loading}
        emptyTitle={t('users.empty')}
        emptyHint={t('users.emptyHint')}
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
    </>
  );
}
