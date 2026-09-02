import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Heading } from '@/shared/ui/typography/Heading';
import { cn } from '@/shared/lib/cn';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_RADIUS, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminUniversityListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUniversitiesPage() {
  const [items, setItems] = useState<AdminUniversityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounced search — the endpoint only matches `University.name`, so the
  // placeholder says so rather than implying a full-text search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUniversities({ page, limit: PAGE_SIZE, search: query || undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить университеты');
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
          Университеты
        </Heading>
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию вуза..."
          className={cn(
            MONO_LABEL,
            ADMIN_RADIUS,
            'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal w-[260px]',
          )}
        />
        {/* Search matches only University.name — city/country/aliases are not indexed by this endpoint. */}
        <span className={MONO_MUTE}>ТОЛЬКО ПО НАЗВАНИЮ</span>
      </div>

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>
            Университеты не найдены
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className={cn('w-full', ADMIN_TEXT)}>
                <thead className="bg-raised border-b border-default">
                  <tr>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ВУЗ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ГОРОД / СТРАНА</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>РЕЙТИНГ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>UNIRANKS KZ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>ПРОГРАММ</th>
                    <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ОБНОВЛЕНО</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                      <td className={cn(ADMIN_CELL, 'align-top')}>
                        <Link to={`/admin/universities/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                          {item.name}
                        </Link>
                      </td>
                      <td className={cn(ADMIN_CELL, 'text-secondary align-top')}>
                        {[item.city, item.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{item.ranking ?? '—'}</td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>
                        {item.uniranks_kz_rank ?? item.uniranks_note ?? '—'}
                      </td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>{item.programs_count}</td>
                      <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{formatDate(item.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-[var(--border)]">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/admin/universities/${item.id}`}
                  className={cn(ADMIN_TEXT, 'p-3 flex flex-col gap-1.5 hover:bg-hover transition-colors')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-primary">{item.name}</span>
                    <span className={MONO_MUTE}>{item.programs_count} ПРОГРАММ</span>
                  </div>
                  <span className="text-secondary">{[item.city, item.country].filter(Boolean).join(', ') || '—'}</span>
                  <span className={MONO_MUTE}>ОБНОВЛЕНО {formatDate(item.updated_at)}</span>
                </Link>
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
