import { useCallback, useEffect, useState } from 'react';
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
import { AGE_TIER_LABELS, USER_ROLE_LABELS } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminBadge } from '@/shared/ui/admin/AdminBadge';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { UsersPrintReport } from './components/UsersPrintReport';
import { CreateStaffModal } from './components/CreateStaffModal';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminUserDetail, AdminUserListItem, AgeGroup, AssessmentGoal, AssessmentStatus } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'age_group', 'status', 'goal'] as const;

/** Эндпоинта list потолок — `limit: le=100`. */
const PRINT_PAGE_LIMIT = 100;
/** См. `handlePrint`: ниже серверных 5000, потому что это бумага. */
const PRINT_MAX_ROWS = 1000;

/** RIASEC letters, named. The list shows the two strongest by score. */
const RIASEC_LABELS: Record<string, string> = {
  R: 'Реалистичный',
  I: 'Исследовательский',
  A: 'Артистичный',
  S: 'Социальный',
  E: 'Предприимчивый',
  C: 'Конвенциональный',
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
  if (!values) {
    return <span className={ADMIN_META} title="Пусто у junior (проходят MI-тест) и до завершения диагностики">—</span>;
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
  if (!status) {
    return (
      <AdminBadge tone="quiet" title="Пользователь не начинал диагностику">
        Не начата
      </AdminBadge>
    );
  }

  return status === 'in_progress' ? (
    <AdminBadge tone="accent" dot>
      В процессе
    </AdminBadge>
  ) : (
    <AdminBadge tone="neutral" dot>
      Завершена
    </AdminBadge>
  );
}

function formatRelative(value: string): string {
  const date = new Date(value);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays < 1) return 'сегодня';
  if (diffDays === 1) return 'вчера';
  if (diffDays < 30) return `${diffDays} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function AdminUsersPage() {
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
  const [createOpen, setCreateOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<AdminUserDetail | null>(null);

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
        if (!cancelled) setError('Не удалось загрузить пользователей');
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
      setExportError('Не удалось собрать PDF. Попробуйте сузить фильтры.');
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
      setExportError('Не удалось выгрузить CSV. Возможно, выборка слишком большая — сузьте фильтры.');
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
    search ? `Email содержит «${search}»` : null,
    ageGroup ? `Возраст: ${AGE_TIER_LABELS[ageGroup as AgeGroup] ?? ageGroup}` : null,
    status ? `Есть тест со статусом: ${ASSESSMENT_STATUS_LABELS[status as AssessmentStatus]}` : null,
    goal ? `Есть тест с целью: ${ASSESSMENT_GOAL_LABELS[goal as AssessmentGoal]}` : null,
  ].filter((value): value is string => value !== null);

  const columns: AdminColumn<AdminUserListItem>[] = [
    {
      key: 'user',
      header: 'Пользователь',
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
              {/* `role` is the source of truth (pro-281) — `is_admin` is just
                  its derived boolean, no longer the thing rendered here. */}
              {item.role === 'admin' && (
                <AdminBadge tone="brand" title="Имеет доступ в админку">
                  Админ
                </AdminBadge>
              )}
              {item.role === 'psychologist' && (
                <AdminBadge tone="accent" title="Кабинет психолога">
                  Психолог
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
      header: 'Возраст',
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
      header: 'Диагностика',
      width: '146px',
      mobile: 'badge',
      cell: (item) => <DiagnosticsCell status={item.latest_assessment_status} />,
    },
    {
      key: 'goal',
      header: 'Цель теста',
      width: '176px',
      headerTitle: 'Цель последнего теста — не обязательно того, что совпал с фильтром «Цель»',
      mobile: 'field',
      mobileLabel: 'Цель',
      cell: (item) =>
        item.latest_assessment_goal ? (
          <span className={ADMIN_TEXT}>{ASSESSMENT_GOAL_LABELS[item.latest_assessment_goal]}</span>
        ) : (
          <span className={ADMIN_META}>—</span>
        ),
    },
    {
      key: 'interests',
      header: 'Интересы',
      width: '210px',
      headerTitle: 'Два ведущих типа RIASEC. Полная раскладка — в карточке пользователя',
      mobile: 'field',
      cell: (item) => <InterestsCell values={item.riasec} />,
    },
    {
      key: 'created',
      // Was "Активность" showing `created_at`, so someone who registered two
      // days ago and never came back read as "active 2 days ago". There is no
      // last-active field in the API — docs/admin-backend-requests-pro-242.md §5.
      header: 'Регистрация',
      width: '126px',
      align: 'right',
      mobile: 'field',
      cell: (item) => (
        <span className={cn(ADMIN_NUM, 'text-muted whitespace-nowrap')}>{formatRelative(item.created_at)}</span>
      ),
    },
  ];

  return (
    <>
      <AdminListHeader
        title="Пользователи"
        description="Учётные записи, их профили и прохождения диагностики."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              muteSound
              isLoading={printing}
              onClick={handlePrint}
              title="Откроется диалог печати — выберите «Сохранить как PDF»"
            >
              <FileText size={14} />
              Экспорт PDF
            </Button>
            <Button variant="ghost" size="sm" muteSound isLoading={exporting} onClick={handleExport}>
              <Download size={14} />
              Экспорт CSV
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
              Создать сотрудника
            </Button>
          </>
        }
      />

      {createdUser && (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[3px] border border-brand bg-brand-subtle">
          <p className={cn(ADMIN_TEXT, 'text-brand m-0')}>
            Создан сотрудник <span className={ADMIN_NUM}>{createdUser.email}</span> ·{' '}
            {USER_ROLE_LABELS[createdUser.role]}. По умолчанию список показывает только учеников — сотрудник
            в нём не появится.
          </p>
          <Link to={`/admin/users/${createdUser.id}`} className={cn(ADMIN_TEXT, 'text-brand font-semibold underline whitespace-nowrap')}>
            Открыть карточку
          </Link>
        </div>
      )}

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: 'Email' }}
        selects={[
          {
            key: 'age_group',
            label: 'Возраст',
            value: ageGroup,
            options: (Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => ({
              value: key,
              label: AGE_TIER_LABELS[key],
            })),
          },
          {
            key: 'status',
            label: 'Есть тест со статусом',
            value: status,
            options: (Object.keys(ASSESSMENT_STATUS_LABELS) as AssessmentStatus[]).map((key) => ({
              value: key,
              label: ASSESSMENT_STATUS_LABELS[key],
            })),
          },
          {
            key: 'goal',
            label: 'Есть тест с целью',
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
          Фильтр находит пользователей, у которых есть хотя бы один подходящий тест. В колонке «Цель
          теста» — всегда последний тест, он может отличаться.
        </p>
      )}

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}
      {exportError && <AdminError message={exportError} />}

      <AdminDataTable
        label="Пользователи"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/users/${item.id}`}
        loading={loading}
        emptyTitle="Пользователи не найдены"
        emptyHint="Попробуйте изменить фильтры или очистить поиск."
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['пользователь', 'пользователя', 'пользователей']} />

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
        onCreated={(user) => setCreatedUser(user)}
      />
    </>
  );
}
