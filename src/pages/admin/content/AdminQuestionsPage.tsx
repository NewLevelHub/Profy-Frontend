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
  contentLocaleOptions,
} from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import { MONO_MUTE } from '@/shared/ui/admin/density';
import type { AdminQuestionListItem, AgeGroup, BigFiveDomain, HollandType, Instrument, MIType } from '@/shared/types';
import type { Locale } from '@/shared/store/locale';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'instrument', 'age_tier', 'locale'] as const;

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
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  const { t } = useTranslation('admin');
  useRememberListQuery('/admin/content/questions');
  const [items, setItems] = useState<AdminQuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { search, instrument, age_tier: ageTier, locale } = values;

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
          locale: (locale as Locale) || undefined,
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
  }, [page, instrument, ageTier, search, locale, reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const columns: AdminColumn<AdminQuestionListItem>[] = [
    {
      key: 'text',
      header: t('questions.col.text'),
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
      width: '104px',
      mobile: 'field',
      headerTitle: t('questions.col.ageHint'),
      cell: (item) => <span className="text-secondary">{AGE_TIER_LABELS[item.age_tier]}</span>,
    },
    {
      key: 'locale',
      header: t('common.col.locale'),
      width: '88px',
      mobile: 'badge',
      headerTitle: t('questions.col.localeHint'),
      cell: (item) => <LocaleBadge locale={item.locale} />,
    },
    {
      key: 'order',
      header: t('questions.col.order'),
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
      width: '72px',
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

      <AdminDataTable
        label={t('questions.tableLabel')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/questions/${item.id}`}
        loading={loading}
        emptyTitle={t('questions.empty')}
        emptyHint={t('questions.emptyHint')}
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="questions" />
    </>
  );
}
