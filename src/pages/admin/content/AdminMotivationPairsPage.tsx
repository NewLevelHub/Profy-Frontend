import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminMotivationPairListItem } from '@/shared/types';

const PAGE_SIZE = 20;

export default function AdminMotivationPairsPage() {
  const [items, setItems] = useState<AdminMotivationPairListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listMotivationPairs({ page, limit: PAGE_SIZE });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить пары мотивации');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rowStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rowEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <Heading level="display-sm" className="text-primary">
          Пары мотивации (Harter-style)
        </Heading>
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Пары не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>№ ПАРЫ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>КАТЕГОРИЯ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>{item.pair_index}</td>
                    <td className={cn(ADMIN_CELL, 'align-top')}>
                      <Link to={`/admin/content/motivation-pairs/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                        {MOTIVATION_CATEGORY_LABELS[item.category_a]}
                      </Link>
                      {item.category_a !== item.category_b && (
                        <span className="text-danger font-semibold ml-2 text-xs">⚠ category_a ≠ category_b</span>
                      )}
                    </td>
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
