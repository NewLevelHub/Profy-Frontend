import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import {
  AGE_TIER_LABELS,
  BIGFIVE_DOMAIN_LABELS,
  HOLLAND_TYPE_LABELS,
  INSTRUMENT_LABELS,
  MI_TYPE_LABELS,
} from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminQuestionListItem, AgeGroup, BigFiveDomain, HollandType, Instrument, MIType } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'instrument', 'age_tier'] as const;
/** Поля сортировки, которые принимает эндпоинт — незнакомое значение
 *  в URL игнорируется, а не улетает на сервер за 422. */
const SORTABLE_KEYS = ['order', 'instrument', 'age_tier', 'text'] as const;

/**
 * The scored category, named rather than coded.
 *
 * The list printed the raw enum value — "R", "N", "verbal" — while the detail
 * screen for the very same row showed "R — Реалистичный" / "N — Эмоциональная
 * чувствительность" / "Слова и истории". Nothing is gained by making the list
 * the only place that speaks in codes.
 */
function TypeCell({ item }: { item: AdminQuestionListItem }) {
  const { t } = useTranslation('admin');
  const label = resolveTypeLabel(item, t);
  if (!label) return <span className={MONO_MUTE}>—</span>;
  return <span className="text-secondary">{label}</span>;
}

function resolveTypeLabel(item: AdminQuestionListItem, t: (key: string) => string): string | null {
  if (item.instrument === 'riasec' && item.riasec_type) {
    return t(HOLLAND_TYPE_LABELS[item.riasec_type as HollandType]) ?? item.riasec_type;
  }
  if (item.instrument === 'big_five' && item.bigfive_domain) {
    return t(BIGFIVE_DOMAIN_LABELS[item.bigfive_domain as BigFiveDomain]) ?? item.bigfive_domain;
  }
  if (item.instrument === 'mi' && item.mi_category) {
    return t(MI_TYPE_LABELS[item.mi_category as MIType]) ?? item.mi_category;
  }
  return null;
}

export default function AdminQuestionsPage() {
  const { t } = useTranslation('admin');
  const { page, values, sort, setSort, setFilter, setPage, clearFilters } =
    useAdminListParams(FILTER_KEYS, SORTABLE_KEYS);
  useRememberListQuery('/admin/content/questions');
  const [items, setItems] = useState<AdminQuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { search, instrument, age_tier: ageTier } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listQuestions({
          page,
          limit: PAGE_SIZE,
          instrument: (instrument as Instrument) || undefined,
          age_tier: (ageTier as AgeGroup) || undefined,
          search: search || undefined,
          sort: sort?.key,
          order: sort?.order,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError(t('questions.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, instrument, ageTier, search, sort?.key, sort?.order, reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const columns: AdminColumn<AdminQuestionListItem>[] = [
    {
      key: 'text',
      header: t('questions.col.text'),
      sortKey: 'text',
      mobile: 'title',
      // Long question texts wrap inside the growing column instead of being
      // clipped to a fixed width.
      cell: (item) => (
        <Link
          to={`/admin/content/questions/${item.id}`}
          title={item.text}
          className="font-medium text-primary hover:text-brand hover:underline"
        >
          {item.text}
        </Link>
      ),
    },
    {
      key: 'instrument',
      header: t('questions.col.instrument'),
      sortKey: 'instrument',
      width: '112px',
      mobile: 'field',
      cell: (item) => <span className="text-secondary">{INSTRUMENT_LABELS[item.instrument]}</span>,
    },
    {
      key: 'type',
      header: t('questions.col.scale'),
      // Самые длинные значения — домены Big Five («N — Эмоциональная
      // чувствительность»); в 168px они обрезались до бессмысленной буквы.
      width: '208px',
      mobile: 'field',
      headerTitle: t('questions.col.scaleHint'),
      cell: (item) => <TypeCell item={item} />,
    },
    {
      key: 'age',
      header: t('common.col.age'),
      sortKey: 'age_tier',
      width: '104px',
      mobile: 'field',
      headerTitle: t('questions.col.ageHint'),
      cell: (item) => <span className="text-secondary">{AGE_TIER_LABELS[item.age_tier]}</span>,
    },
    {
      key: 'order',
      header: t('questions.col.order'),
      sortKey: 'order',
      align: 'right',
      width: '92px',
      mobile: 'field',
      headerTitle: t('questions.col.orderHint'),
      cell: (item) => (
        <span className="font-mono text-mono-sm text-muted tabular-nums">{item.order}</span>
      ),
    },
    {
      key: 'overrides',
      header: '',
      align: 'right',
      // Колонка-маркер: пустой заголовок над 112px пустоты читался как
      // обрезанная таблица и отнимал место у самого вопроса.
      width: '104px',
      mobile: 'badge',
      cell: (item) => (item.has_overrides ? <OverrideBadge /> : null),
    },
  ];

  return (
    <>
      <AdminListHeader
        title={t('questions.title')}
        description={t('questions.description')}
      />

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: t('questions.searchPlaceholder') }}
        selects={[
          {
            key: 'instrument',
            label: t('questions.col.instrument'),
            value: instrument,
            options: (Object.keys(INSTRUMENT_LABELS) as Instrument[]).map((key) => ({
              value: key,
              label: INSTRUMENT_LABELS[key],
            })),
          },
          {
            key: 'age_tier',
            label: t('common.col.age'),
            value: ageTier,
            options: (Object.keys(AGE_TIER_LABELS) as AgeGroup[]).map((key) => ({
              value: key,
              label: AGE_TIER_LABELS[key],
            })),
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      <AdminDataTable
        label={t('questions.tableLabel')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/questions/${item.id}`}
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        emptyTitle={t('questions.empty')}
        emptyHint={t('questions.emptyHint')}
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="questions" />
    </>
  );
}
