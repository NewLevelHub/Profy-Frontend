import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { Card } from '@/shared/ui/Card';
import { PageContainer } from '@/shared/ui/PageContainer';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import type { AdminUniversityListItem } from '@/shared/types';

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUniversities({ page, limit: 20, search: query || undefined });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить список университетов');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, query]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Университеты"
        subtitle="Редактирование справочника вузов, специальностей и требований"
      />

      <Card>
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию университета"
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius)] border border-default bg-page text-primary font-semibold text-sm"
            />
          </div>
          <Button type="submit">Найти</Button>
        </form>
      </Card>

      {error && (
        <Card className="text-red-600 font-semibold">{error}</Card>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-secondary font-semibold">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-secondary font-semibold">
            Университеты не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-raised border-b border-default">
                <tr>
                  <th className="text-left px-4 py-3 font-extrabold">Название</th>
                  <th className="text-left px-4 py-3 font-extrabold">Город</th>
                  <th className="text-left px-4 py-3 font-extrabold">Страна</th>
                  <th className="text-left px-4 py-3 font-extrabold text-center">Рейтинг</th>
                  <th className="text-left px-4 py-3 font-extrabold text-center">Программы</th>
                  <th className="text-left px-4 py-3 font-extrabold">Проверен</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-default last:border-b-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/universities/${item.id}`}
                        className="font-bold text-brand hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.city}</td>
                    <td className="px-4 py-3">{item.country}</td>
                    <td className="px-4 py-3 text-center">{item.ranking ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{item.programs_count}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(item.updated_at)}</td>
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
