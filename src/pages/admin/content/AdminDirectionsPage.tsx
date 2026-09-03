import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_RADIUS, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminDirectionListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export default function AdminDirectionsPage() {
  const [items, setItems] = useState<AdminDirectionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const data = await adminApi.listDirections({ page, limit: PAGE_SIZE, search: query || undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить направления');
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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <Heading level="display-sm" className="text-primary">
          Направления
        </Heading>
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию направления..."
        className={cn(MONO_LABEL, ADMIN_RADIUS, 'border border-default bg-page text-primary px-2 py-1 normal-case tracking-normal w-[260px]')}
      />

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Направления не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>НАПРАВЛЕНИЕ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>SLUG</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>HOLLAND CODE</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'align-top')}>
                      <Link to={`/admin/content/directions/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                        {item.name}
                      </Link>
                    </td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{item.slug}</td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top')}>{item.holland_code}</td>
                    <td className={cn(ADMIN_CELL, 'align-top text-right')}>{item.has_overrides && <OverrideBadge />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminPager page={page} totalPages={totalPages} rowStart={rowStart} rowEnd={rowEnd} total={total} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
    </div>
  );
}
