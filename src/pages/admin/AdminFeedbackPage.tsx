import { useEffect, useState } from 'react';
import { adminApi } from '@/shared/api/admin';
import { AdminTabs } from '@/shared/ui/admin/AdminTabs';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import type { AdminFeedbackListItem, FeedbackRating } from '@/shared/types';

const RATING_LABELS: Record<FeedbackRating, string> = {
  good: '🙂 Хорошо',
  neutral: '😐 Средне',
  bad: '🙁 Плохо',
};

const RATING_FILTERS: { value: FeedbackRating | null; label: string }[] = [
  { value: null, label: 'Все' },
  { value: 'good', label: 'Хорошо' },
  { value: 'neutral', label: 'Средне' },
  { value: 'bad', label: 'Плохо' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<AdminFeedbackListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listFeedback({ page, limit: 20, rating: rating ?? undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить фидбек');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, rating]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Фидбек"
        subtitle="Оценки и комментарии пользователей о продукте"
      />

      <AdminTabs />

      <div className="flex gap-2">
        {RATING_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setPage(1);
              setRating(filter.value);
            }}
            className={cn(
              'px-3 py-1.5 rounded-pill border font-semibold text-sm transition-colors',
              rating === filter.value
                ? 'border-brand bg-brand-subtle text-brand'
                : 'border-default text-secondary hover:bg-raised',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && (
        <Card className="text-red-600 font-semibold">{error}</Card>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-secondary font-semibold">
            Фидбек не найден
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className="text-left px-4 py-3 font-extrabold">Дата</th>
                  <th className="text-left px-4 py-3 font-extrabold">Пользователь</th>
                  <th className="text-left px-4 py-3 font-extrabold">Оценка</th>
                  <th className="text-left px-4 py-3 font-extrabold">Направление</th>
                  <th className="text-left px-4 py-3 font-extrabold">Сообщение</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0 align-top">
                    <td className="px-4 py-3 text-secondary whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 font-semibold">{item.user_email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{RATING_LABELS[item.rating]}</td>
                    <td className="px-4 py-3">{item.direction_slug ?? '—'}</td>
                    <td className="px-4 py-3 text-secondary max-w-md">{item.message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-secondary font-semibold">
            Всего: {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </Button>
            <span className="px-3 py-2 text-sm font-semibold text-secondary">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
