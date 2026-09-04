import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { pluralize } from '@/shared/lib/plural';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { MOTIVATION_CATEGORY_LABELS } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminMotivationPairListItem, MotivationCategory } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'category'] as const;

export default function AdminMotivationPairsPage() {
  const { page, values, sort, setSort, setFilter, setPage, clearFilters, activeCount } =
    useAdminListParams(FILTER_KEYS);
  useRememberListQuery('/admin/content/motivation-pairs');
  const [items, setItems] = useState<AdminMotivationPairListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { search, category } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listMotivationPairs({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          category: category || undefined,
          sort: sort?.key,
          order: sort?.order,
        });
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
  }, [page, search, category, sort?.key, sort?.order, reloadToken]);

  const mismatched = items.filter((item) => item.category_a !== item.category_b).length;

  /**
   * Банк держит ровно 2 пары на каждую из 9 категорий — на этом стоит равный
   * вес мотивов в подсчёте. Правка категории одной пары ломает баланс молча,
   * поэтому сверяем здесь.
   *
   * Считаем только когда на экране ВЕСЬ банк: по одной странице такой вывод
   * был бы неверным, а по отфильтрованной выдаче — прямо ложным (поиск,
   * вернувший одну строку, объявил бы её категорию несбалансированной).
   */
  const wholeList = !loading && activeCount === 0 && items.length === total;
  const unbalanced = wholeList
    ? [...items.reduce((counts, item) => {
        counts.set(item.category_a, (counts.get(item.category_a) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())].filter(([, count]) => count !== 2)
    : [];

  const columns: AdminColumn<AdminMotivationPairListItem>[] = [
    {
      key: 'pair',
      header: '№',
      sortKey: 'pair_index',
      width: '64px',
      mobile: 'field',
      cell: (item) => <span className={cn(ADMIN_NUM, 'text-muted')}>{item.pair_index}</span>,
    },
    {
      // Категорий девять, а пар восемнадцать — то есть на каждую приходится по
      // две строки с одинаковой подписью. «Пара #1 · Интерес к делу» и «Пара #2
      // · Интерес к делу» ничем не отличались; строку опознаёт её текст.
      key: 'text',
      header: 'Мотив выражен',
      mobile: 'title',
      headerTitle:
        'Сторона A — формулировка, где мотив выражен. Противоположный полюс (сторона B) — в карточке пары.',
      // Текст приходит прямо в строке списка — раньше на каждую строку
      // страницы уходил отдельный запрос за карточкой пары.
      cell: (item) => (
        <Link
          to={`/admin/content/motivation-pairs/${item.id}`}
          title={`Противоположный полюс: ${item.text_b}`}
          className={cn(ADMIN_TEXT, 'font-medium text-primary hover:text-brand hover:underline')}
        >
          {item.text_a}
        </Link>
      ),
    },
    {
      key: 'category',
      header: 'Категория',
      sortKey: 'category_a',
      width: '200px',
      mobile: 'subtitle',
      headerTitle: 'Обе стороны пары — полюса одной категории',
      cell: (item) => (
        <span className={cn(ADMIN_TEXT, 'text-secondary')}>
          {MOTIVATION_CATEGORY_LABELS[item.category_a]}
        </span>
      ),
    },
    {
      key: 'health',
      header: '',
      width: '188px',
      mobile: 'badge',
      // Was a raw "⚠ category_a ≠ category_b" in the cell — a field-name
      // comparison shown to a person editing content, not to a developer.
      cell: (item) =>
        item.category_a !== item.category_b ? (
          <span className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1 text-danger font-semibold whitespace-nowrap')}>
            <AlertTriangle size={12} />
            Стороны из разных категорий
          </span>
        ) : null,
    },
    {
      key: 'overrides',
      header: '',
      align: 'right',
      width: '72px',
      mobile: 'badge',
      cell: (item) => (item.has_overrides ? <OverrideBadge /> : null),
    },
  ];

  return (
    <>
      <AdminListHeader
        title="Пары мотивации"
        description="Формат Harter: ученик выбирает между двумя полюсами одной и той же категории, а не между разными категориями."
      />

      <AdminToolbar
        search={{
          value: search,
          onChange: (value) => setFilter('search', value),
          placeholder: 'Текст любой из сторон',
        }}
        selects={[
          {
            key: 'category',
            label: 'Категория',
            value: category,
            options: (Object.keys(MOTIVATION_CATEGORY_LABELS) as MotivationCategory[]).map((key) => ({
              value: key,
              label: MOTIVATION_CATEGORY_LABELS[key],
            })),
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      {/* Число пар называет подвал — здесь только то, что требует внимания. */}
      {mismatched > 0 && (
        <p className={cn(ADMIN_TEXT, 'inline-flex items-center gap-1.5 text-danger m-0')}>
          <AlertTriangle size={13} />
          {pluralize(mismatched, 'пара', 'пары', 'пар')} со сторонами из разных категорий
        </p>
      )}

      {unbalanced.length > 0 && (
        <p className={cn(ADMIN_META, 'm-0')}>
          На категорию должно приходиться по 2 пары — сейчас не так у:{' '}
          {unbalanced
            .map(
              ([category, count]) =>
                `${MOTIVATION_CATEGORY_LABELS[category as keyof typeof MOTIVATION_CATEGORY_LABELS] ?? category} (${count})`,
            )
            .join(', ')}
          . Мотивы получат разный вес в подсчёте.
        </p>
      )}

      <AdminDataTable
        label="Пары мотивации"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/motivation-pairs/${item.id}`}
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        emptyTitle="Пары не найдены"
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['пара', 'пары', 'пар']} />
    </>
  );
}
