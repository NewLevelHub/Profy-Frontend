import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { MOTIVATION_CATEGORY_LABELS, contentLocaleOptions } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { useDetailPreviews } from './useDetailPreviews';
import type { AdminMotivationPairListItem } from '@/shared/types';
import type { Locale } from '@/shared/store/locale';

// 18 logical pairs, one row per locale since KZ-301 — the whole bank is 36
// rows. The balance check below only runs when the entire list is on screen,
// so the page has to stay big enough to hold it (endpoint caps `limit` at 100).
const PAGE_SIZE = 40;
const FILTER_KEYS = ['locale'] as const;

export default function AdminMotivationPairsPage() {
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  const { t } = useTranslation('admin');
  const { locale } = values;
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
        const data = await adminApi.listMotivationPairs({
          page,
          limit: PAGE_SIZE,
          locale: (locale as Locale) || undefined,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError(t('motivationPairs.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, locale, reloadToken]);

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
  // Counted per (locale, category), not per category: every locale carries its
  // own complete set of pairs, so counting across locales makes each category
  // look like it has 4 — the whole bank would report as unbalanced.
  const unbalanced = wholeList
    ? [...items.reduce((counts, item) => {
        const key = `${item.locale}:${item.category_a}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())]
        .filter(([, count]) => count !== 2)
        .map(([key, count]) => [key.slice(key.indexOf(':') + 1), count] as [string, number])
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
      header: t('motivationPairs.col.side'),
      mobile: 'title',
      headerTitle:
        t('motivationPairs.col.sideHint'),
      cell: (item) => {
        const preview = previews.get(item.id);
        return (
          <Link
            to={`/admin/content/motivation-pairs/${item.id}`}
            title={preview?.textB ? t('motivationPairs.oppositePole', { text: preview.textB }) : undefined}
            className={cn(ADMIN_TEXT, 'font-medium text-primary hover:text-brand hover:underline')}
          >
            {preview?.textA ?? <span className="text-muted">{t('questionPairs.pairNo', { index: item.pair_index })}</span>}
          </Link>
        );
      },
    },
    {
      key: 'category',
      header: t('motivationPairs.col.category'),
      width: '200px',
      mobile: 'subtitle',
      headerTitle: t('motivationPairs.col.categoryHint'),
      cell: (item) => (
        <span className={cn(ADMIN_TEXT, 'text-secondary')}>
          {t(MOTIVATION_CATEGORY_LABELS[item.category_a])}
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
            {t('motivationPairs.sidesMismatch')}
          </span>
        ) : null,
    },
    {
      key: 'locale',
      header: t('common.col.locale'),
      width: '88px',
      mobile: 'badge',
      headerTitle: t('questionPairs.col.localeHint'),
      cell: (item) => <LocaleBadge locale={item.locale} />,
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
        title={t('motivationPairs.title')}
        description={t('motivationPairs.description')}
      />

      <AdminToolbar
        selects={[
          {
            key: 'locale',
            label: t('common.col.locale'),
            value: locale,
            options: contentLocaleOptions(t),
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
          {t('motivationPairs.mismatchedCount', { count: mismatched })}
        </p>
      )}

      {unbalanced.length > 0 && (
        <p className={cn(ADMIN_META, 'm-0')}>
          {t('motivationPairs.unbalanced')}{' '}
          {unbalanced
            .map(
              ([category, count]) =>
                `${t(MOTIVATION_CATEGORY_LABELS[category as keyof typeof MOTIVATION_CATEGORY_LABELS]) ?? category} (${count})`,
            )
            .join(', ')}
          {t('motivationPairs.unbalancedTail')}
        </p>
      )}

      <AdminDataTable
        label={t('motivationPairs.title')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/motivation-pairs/${item.id}`}
        loading={loading}
        emptyTitle={t('questionPairs.empty')}
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="pairs" />
    </>
  );
}
