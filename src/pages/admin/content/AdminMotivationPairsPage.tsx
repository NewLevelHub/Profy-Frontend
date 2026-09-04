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
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { useDetailPreviews } from './useDetailPreviews';
import type { AdminMotivationPairListItem } from '@/shared/types';

const PAGE_SIZE = 20;

export default function AdminMotivationPairsPage() {
  const { page, setPage } = useAdminListParams([] as const);
  useRememberListQuery('/admin/content/motivation-pairs');
  const [items, setItems] = useState<AdminMotivationPairListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

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
  }, [page, reloadToken]);

  const previews = useDetailPreviews('motivation-pairs', items.map((item) => item.id), (id) =>
    adminApi.getMotivationPair(id).then((detail) => ({ textA: detail.text_a, textB: detail.text_b })),
  );

  const mismatched = items.filter((item) => item.category_a !== item.category_b).length;

  /**
   * Банк держит ровно 2 пары на каждую из 9 категорий — на этом стоит равный
   * вес мотивов в подсчёте. Правка категории одной пары ломает баланс молча,
   * поэтому сверяем здесь. Считаем только когда на экране весь список: по
   * одной странице такой вывод был бы неверным.
   */
  const wholeList = !loading && items.length === total;
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
      cell: (item) => {
        const preview = previews.get(item.id);
        return (
          <Link
            to={`/admin/content/motivation-pairs/${item.id}`}
            title={preview?.textB ? `Противоположный полюс: ${preview.textB}` : undefined}
            className={cn(ADMIN_TEXT, 'font-medium text-primary hover:text-brand hover:underline')}
          >
            {preview?.textA ?? <span className="text-muted">Пара #{item.pair_index}</span>}
          </Link>
        );
      },
    },
    {
      key: 'category',
      header: 'Категория',
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
        loading={loading}
        emptyTitle="Пары не найдены"
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['пара', 'пары', 'пар']} />
    </>
  );
}
