import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { AGE_TIER_LABELS, INSTRUMENT_LABELS, contentLocaleOptions } from '@/shared/lib/contentLabels';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { LocaleBadge } from '@/shared/ui/admin/LocaleBadge';
import { ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { useDetailPreviews } from './useDetailPreviews';
import type { AdminQuestionPairListItem, AgeGroup, Instrument } from '@/shared/types';
import type { Locale } from '@/shared/store/locale';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['instrument', 'age_tier', 'locale'] as const;

export default function AdminQuestionPairsPage() {
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  const { t } = useTranslation('admin');
  useRememberListQuery('/admin/content/question-pairs');
  const [items, setItems] = useState<AdminQuestionPairListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { instrument, age_tier: ageTier, locale } = values;
  const previews = useDetailPreviews('question-pairs', items.map((item) => item.id), (id) =>
    adminApi.getQuestionPair(id).then((detail) => ({
      optionA: detail.option_a_text,
      optionB: detail.option_b_text,
      frame: detail.frame,
    })),
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listQuestionPairs({
          page,
          limit: PAGE_SIZE,
          instrument: (instrument as Instrument) || undefined,
          age_tier: (ageTier as AgeGroup) || undefined,
          locale: (locale as Locale) || undefined,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError(t('questionPairs.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, instrument, ageTier, locale, reloadToken]);

  const columns: AdminColumn<AdminQuestionPairListItem>[] = [
    {
      key: 'pair',
      header: '№',
      width: '72px',
      mobile: 'field',
      // Раньше тут было написано «номер внутри своего инструмента и возраста» —
      // неправда: `pair_index` сквозной по всей таблице. Блоками идёт не
      // нумерация, а порядок выдачи: бэкенд сортирует по инструменту, потом по
      // номеру, поэтому после junior RIASEC сразу идёт middle RIASEC.
      headerTitle:
        t('questionPairs.col.indexHint'),
      cell: (item) => <span className={cn(ADMIN_NUM, 'text-muted')}>{item.pair_index}</span>,
    },
    {
      // Раньше строка состояла из «Пара #12 · RIASEC · Junior» — то же самое,
      // что у соседних шестидесяти шести. Найти нужную пару можно было только
      // пересчётом. Теперь строка говорит, о чём пара.
      key: 'options',
      header: t('questionPairs.col.options'),
      mobile: 'title',
      cell: (item) => {
        const preview = previews.get(item.id);
        return (
          <Link
            to={`/admin/content/question-pairs/${item.id}`}
            title={preview?.frame ?? undefined}
            className={cn(ADMIN_TEXT, 'font-medium text-primary hover:text-brand hover:underline')}
          >
            {preview ? (
              <>
                {preview.optionA ?? t('questionPairs.fromQuestion')}
                <span className="text-muted mx-1.5">↔</span>
                {preview.optionB ?? t('questionPairs.fromQuestion')}
              </>
            ) : (
              <span className="text-muted">{t('questionPairs.pairNo', { index: item.pair_index })}</span>
            )}
          </Link>
        );
      },
    },
    {
      key: 'instrument',
      header: t('questions.col.instrument'),
      width: '112px',
      mobile: 'field',
      cell: (item) => <span className="text-secondary">{INSTRUMENT_LABELS[item.instrument]}</span>,
    },
    {
      key: 'age',
      header: t('common.col.age'),
      width: '104px',
      mobile: 'field',
      cell: (item) => <span className="text-secondary">{AGE_TIER_LABELS[item.age_tier]}</span>,
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
        title={t('questionPairs.title')}
        description={t('questionPairs.description')}
      />

      <AdminToolbar
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
        label={t('questionPairs.title')}
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/question-pairs/${item.id}`}
        loading={loading}
        emptyTitle={t('questionPairs.empty')}
        emptyHint={t('questions.emptyHint')}
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} countKey="pairs" />
    </>
  );
}
