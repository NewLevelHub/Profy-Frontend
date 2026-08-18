import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, X } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Heading } from '@/shared/ui/typography/Heading';
import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_RADIUS, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminUserListItem, AssessmentStatus } from '@/shared/types';

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  in_progress: 'В процессе',
  completed: 'Завершена',
};

/**
 * ДИАГНОСТИКА cell: compact Spine (already built at 0.75 thickness for this
 * exact table use case — reused, not rebuilt) plus a mono status line.
 *
 * BACKEND GAP: `AdminUserListItem.latest_assessment_status` only distinguishes
 * `in_progress` / `completed` (see `AssessmentStatus` in shared/types) — there
 * is no per-row "41/60", "пауза 3 дня", or "обрыв на блоке N" detail anywhere
 * in the list response. The spec's pause/drop-off variants need a real
 * backend addition (per-row progress + last-activity gap) to render honestly;
 * faking those numbers here would be exactly the kind of fabrication this
 * pass is meant to avoid, so only the two states the API actually reports are
 * drawn, in the color the spec assigns them (mute for done, Dawn for open).
 */
function DiagnosticsCell({ status }: { status: AssessmentStatus | null }) {
  if (!status) {
    return <span className={MONO_MUTE}>—</span>;
  }

  const nodes: SpineNode[] = [
    { id: 'start', status: 'done' },
    { id: 'mid', status: status === 'completed' ? 'done' : 'current' },
    { id: 'end', status: status === 'completed' ? 'done' : 'upcoming', goal: true },
  ];

  return (
    <div className="flex flex-col gap-1 min-w-[104px]">
      <Spine nodes={nodes} thickness={0.75} ariaLabel={STATUS_LABELS[status]} />
      <span
        className={cn(MONO_LABEL, status === 'in_progress' ? 'text-[color:var(--dawn)]' : 'text-muted')}
      >
        {status === 'completed' ? 'ЗАВЕРШЕНА' : 'В ПРОЦЕССЕ'}
      </span>
    </div>
  );
}

/** One label/value pair inside the mobile card-per-row transform below `lg`. */
function AdminCardField({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div title={title}>
      <p className={MONO_MUTE}>{label}</p>
      <p className="font-mono text-muted mt-0.5">{value}</p>
    </div>
  );
}

function formatRelative(value: string): string {
  const then = new Date(value).getTime();
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  const days = Math.floor(hr / 24);
  return `${days} дн назад`;
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Filled Pine-tinted chip for an active filter, removable. */
function ActiveChip({ children, onRemove }: { children: string; onRemove: () => void }) {
  return (
    <span className={cn(MONO_LABEL, 'inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-[3px] bg-brand-subtle text-brand')}>
      {children}
      <button type="button" onClick={onRemove} className="hover:opacity-70" aria-label="Убрать фильтр">
        <X size={11} />
      </button>
    </span>
  );
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUsers({ page, limit: PAGE_SIZE, search: query || undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setUpdatedAt(new Date());
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
  }, [page, query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rowStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rowEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <PageContainer className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <Heading level="display-sm" className="text-primary">
          Пользователи
        </Heading>
        {/*
          Real aggregate: `total` comes straight from `AdminUserListResponse.total`.
          "ЗА 7 ДНЕЙ" from the mockup is NOT rendered — the list endpoint has no
          signup-cohort aggregate, and computing it from the current page alone
          would silently mean "new signups on this page of 20", not a real
          7-day total; that's a backend gap, not a formatting choice.
        */}
        <span className={MONO_MUTE}>
          {total} ВСЕГО{updatedAt ? ` · ОБНОВЛЕНО ${formatClock(updatedAt).toUpperCase()}` : ''}
        </span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {query ? (
            <ActiveChip
              onRemove={() => {
                setSearch('');
                setQuery('');
                setPage(1);
              }}
            >
              {`EMAIL: ${query.toUpperCase()}`}
            </ActiveChip>
          ) : null}

          {filterOpen ? (
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setQuery(search.trim());
                setFilterOpen(false);
              }}
            >
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="email содержит..."
                className={cn(MONO_LABEL, ADMIN_RADIUS, 'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal w-[180px]')}
              />
              <button type="submit" className={cn(MONO_LABEL, 'px-2 py-1 rounded-[3px] bg-brand text-on-brand')}>
                OK
              </button>
            </form>
          ) : (
            /*
              Only real, server-supported filter today is the `search` param
              on `adminApi.listUsers` (matched against email). The spec's
              richer filter row (status / goal / dropout / etc.) has no
              query-param support on the backend, so no inactive chips are
              rendered for filters that would silently do nothing.
            */
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={cn(MONO_LABEL, 'inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] border border-dashed border-default text-muted hover:text-secondary hover:border-strong transition-colors')}
            >
              <Plus size={11} />
              ФИЛЬТР
            </button>
          )}
        </div>

        {/*
          Mockup's "брошено на диагностике: N" needs an aggregate of
          in-progress-with-no-recent-activity users across the WHOLE table,
          which the list endpoint doesn't compute or expose (no last-activity
          field, no server-side aggregate). Labeling a page-local count with
          that copy would misstate it as a global stat, so it's omitted with
          an honest note instead of a wrong number.
        */}
        <span className={MONO_MUTE} title="Бэкенд не отдаёт агрегат по обрывам диагностики">
          БРОШЕНО НА ДИАГНОСТИКЕ: НЕТ ДАННЫХ
        </span>
      </div>

      {error && (
        <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>
      )}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>
            Пользователи не найдены
          </div>
        ) : (
          <>
            {/*
              7 real+placeholder columns is too dense to read even with the
              table's own horizontal scroll below lg — the two most
              glanceable facts (who, diagnostic status) end up scrolled
              off-screen on a phone. Card-per-row below lg, unchanged table
              at lg+ where there's room for all seven columns at once.
            */}
            <div className="hidden lg:block overflow-x-auto">
              <table className={cn('w-full', ADMIN_TEXT)}>
                <thead className="bg-raised border-b border-default">
                  <tr>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ID</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ПОЛЬЗОВАТЕЛЬ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ВОЗРАСТ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ДИАГНОСТИКА</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>РОДИТЕЛЬ · ДОСТУП</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ROADMAP</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>АКТИВНОСТЬ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                      <td className={cn(ADMIN_CELL, 'font-mono text-mono-sm text-muted align-top')}>
                        {item.id.slice(0, 8)}
                      </td>
                      <td className={cn(ADMIN_CELL, 'align-top')}>
                        <Link to={`/admin/users/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                          {item.has_profile && item.profile_name ? item.profile_name : item.email}
                        </Link>
                        {/*
                          Mockup wants "· age · grade" inline. AdminUserListItem
                          carries no age/grade — those only exist on
                          AdminUserDetail.profile, one level deeper. Rather than
                          fetch every row's detail just to fill this in (an N+1
                          the list page shouldn't pay for), this is left as a
                          real gap: the list endpoint needs age/grade added to
                          AdminUserListItem for this to render honestly.
                        */}
                        <div className="font-mono text-mono-xs text-muted mt-0.5">{item.email}</div>
                        {item.is_admin && (
                          <span className={cn(MONO_LABEL, 'text-brand')}>ADMIN</span>
                        )}
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')} title="Возрастной/целевой tier-код не приходит с бэкенда">
                        —
                      </td>
                      <td className={cn(ADMIN_CELL, 'align-top')}>
                        <DiagnosticsCell status={item.latest_assessment_status} />
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')} title="Связь ребёнок—родитель не приходит с бэкенда ни в одном admin-эндпоинте">
                        —
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')} title="Список не отдаёт долю пройденных этапов roadmap">
                        —
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')} title="Только дата регистрации — поле «последняя активность» отсутствует">
                        {formatRelative(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-[var(--border)]">
              {items.map((item) => (
                <div key={item.id} className={cn(ADMIN_TEXT, 'p-3 flex flex-col gap-2.5')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/admin/users/${item.id}`}
                        className="font-semibold text-primary hover:text-brand hover:underline block truncate"
                      >
                        {item.has_profile && item.profile_name ? item.profile_name : item.email}
                      </Link>
                      <div className="font-mono text-mono-xs text-muted mt-0.5 truncate">{item.email}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={MONO_MUTE}>{item.id.slice(0, 8)}</span>
                      {item.is_admin && <span className={cn(MONO_LABEL, 'text-brand')}>ADMIN</span>}
                    </div>
                  </div>

                  <DiagnosticsCell status={item.latest_assessment_status} />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-default">
                    <AdminCardField
                      label="РОДИТЕЛЬ · ДОСТУП"
                      value="—"
                      title="Связь ребёнок—родитель не приходит с бэкенда ни в одном admin-эндпоинте"
                    />
                    <AdminCardField
                      label="ROADMAP"
                      value="—"
                      title="Список не отдаёт долю пройденных этапов roadmap"
                    />
                    <AdminCardField
                      label="АКТИВНОСТЬ"
                      value={formatRelative(item.created_at)}
                      title="Только дата регистрации — поле «последняя активность» отсутствует"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={MONO_MUTE}>
          СТРОКИ {rowStart}–{rowEnd} ИЗ {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
          >
            ПРЕД
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={cn(MONO_LABEL, 'px-2.5 py-1 rounded-[3px] border border-default text-secondary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors')}
          >
            СЛЕД
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
