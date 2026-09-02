import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { Heading } from '@/shared/ui/typography/Heading';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_CARD, ADMIN_CELL, ADMIN_TEXT, MONO_LABEL, MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminMotivationStatementListItem } from '@/shared/types';

const PAGE_SIZE = 20;

export default function AdminMotivationStatementsPage() {
  const [items, setItems] = useState<AdminMotivationStatementListItem[]>([]);
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
        const data = await adminApi.listMotivationStatements({ page, limit: PAGE_SIZE });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить утверждения');
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
          Утверждения мотивации (MOST/LEAST)
        </Heading>
        <span className={MONO_MUTE}>{total} ВСЕГО</span>
      </div>

      {error && <div className={cn(ADMIN_CARD, 'text-danger font-semibold', ADMIN_TEXT)}>{error}</div>}

      <div className={cn(ADMIN_CARD, 'p-0 overflow-hidden')}>
        {loading ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={cn('py-12 text-center text-secondary font-semibold', ADMIN_TEXT)}>Утверждения не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className={cn('w-full', ADMIN_TEXT)}>
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>ТРИПЛЕТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-right text-muted')}>ПОРЯДОК</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>КАТЕГОРИЯ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')}>ТЕКСТ</th>
                  <th className={cn(ADMIN_CELL, MONO_LABEL, 'text-left text-muted')} />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0 hover:bg-hover transition-colors">
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>{item.triplet_index}</td>
                    <td className={cn(ADMIN_CELL, 'font-mono text-muted align-top text-right')}>{item.order}</td>
                    <td className={cn(ADMIN_CELL, 'text-secondary align-top')}>{MOTIVATION_CATEGORY_LABELS[item.category]}</td>
                    <td className={cn(ADMIN_CELL, 'align-top max-w-[420px]')}>
                      <Link to={`/admin/content/motivation-statements/${item.id}`} className="font-semibold text-primary hover:text-brand hover:underline">
                        {item.text}
                      </Link>
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
