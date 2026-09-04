import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { cn } from '@/shared/lib/cn';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import type { AdminUniversityCountry, AdminUniversityListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'country', 'has_programs'] as const;

const HOME_COUNTRY = 'Казахстан';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Server paging, plainly.
 *
 * This screen used to download the entire catalog (three requests at
 * `limit=100`) and filter, sort and paginate it in the browser, because the
 * endpoint took nothing but `page`, `limit` and a `search` that matched only
 * `University.name`. All three gaps are closed now — `?country=`,
 * `?sort=&order=` with a Russian collation, and a search that also matches
 * city, short name and aliases — so the workaround is gone and the numbers in
 * the pager are the server's own, not a slice of a partial download.
 */
export default function AdminUniversitiesPage() {
  const { page, values, sort, setSort, setFilter, setPage, clearFilters } =
    useAdminListParams(FILTER_KEYS);
  useRememberListQuery('/admin/universities');

  const [items, setItems] = useState<AdminUniversityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [countries, setCountries] = useState<AdminUniversityCountry[]>([]);

  const { search, country, has_programs: hasPrograms } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listUniversities({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          country: country || undefined,
          has_programs: hasPrograms ? hasPrograms === 'yes' : undefined,
          sort: sort?.key,
          order: sort?.order,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить каталог вузов');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, country, hasPrograms, sort?.key, sort?.order, reloadToken]);

  // Loaded once: the filter needs every country in the catalog, not just the
  // ones that happen to be on this page.
  useEffect(() => {
    let cancelled = false;
    adminApi
      .listUniversityCountries()
      .then((data) => {
        if (!cancelled) setCountries(data);
      })
      .catch(() => {
        // A missing facet must not take the table down with it — the filter
        // simply has no options to offer.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  // Which ranking deserves a column depends on which half of the catalog you
  // are working in: `ranking` is filled for 62 mostly-foreign universities,
  // `uniranks_kz_rank` for 28 Kazakh ones. Showing both to everyone meant
  // every admin always read one column of dashes.
  const showWorldRanking = country !== HOME_COUNTRY;
  const showKzRanking = !country || country === HOME_COUNTRY;

  const rankingColumn: AdminColumn<AdminUniversityListItem> = {
    key: 'ranking',
    header: 'Рейтинг',
    sortKey: 'ranking',
    align: 'right',
    width: '108px',
    mobile: 'field',
    // One Integer holds a QS world position, a national tier and a field rank
    // at once, so 32 and 248 are not comparable. `ranking_label` is the string
    // the source actually gave; now that the list carries it, the cell names
    // the scale instead of only warning that it might not be the one assumed.
    headerTitle:
      'Значения из разных источников (мировые, национальные, отраслевые) и между собой не сравнимы — источник в подсказке к числу.',
    cell: (item) =>
      item.ranking != null ? (
        <span className={cn(ADMIN_NUM, 'text-secondary')} title={item.ranking_label ?? undefined}>
          {item.ranking}
        </span>
      ) : (
        <span className={ADMIN_META}>—</span>
      ),
  };

  const uniranksColumn: AdminColumn<AdminUniversityListItem> = {
    key: 'uniranks',
    header: 'Uniranks KZ',
    sortKey: 'uniranks_kz_rank',
    align: 'right',
    width: '128px',
    mobile: 'field',
    headerTitle: 'Позиция в казахстанском рейтинге uniranks.com. Пусто — ещё не проверяли.',
    cell: (item) =>
      item.uniranks_kz_rank != null ? (
        <span className={cn(ADMIN_NUM, 'text-secondary')}>{item.uniranks_kz_rank}</span>
      ) : item.uniranks_note ? (
        <span className={ADMIN_META} title="Проверено: вуза нет в рейтинге">
          {item.uniranks_note}
        </span>
      ) : (
        <span className={ADMIN_META}>—</span>
      ),
  };

  const columns: AdminColumn<AdminUniversityListItem>[] = [
    {
      key: 'name',
      header: 'Вуз',
      sortKey: 'name',
      mobile: 'title',
      cell: (item) => (
        <Link
          to={`/admin/universities/${item.id}`}
          title={item.name}
          className={cn(ADMIN_TEXT, 'font-semibold text-primary hover:text-brand hover:underline')}
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: 'location',
      // With a country picked, repeating it on every row is noise.
      header: country ? 'Город' : 'Город / страна',
      width: country ? '160px' : '220px',
      mobile: 'subtitle',
      cell: (item) => {
        const text = (country ? [item.city] : [item.city, item.country]).filter(Boolean).join(', ');
        return text ? (
          <span className={cn(ADMIN_TEXT, 'text-secondary')}>{text}</span>
        ) : (
          <span className={ADMIN_META}>—</span>
        );
      },
    },
    ...(showWorldRanking ? [rankingColumn] : []),
    ...(showKzRanking ? [uniranksColumn] : []),
    {
      key: 'programs',
      header: 'Программ',
      sortKey: 'programs_count',
      align: 'right',
      width: '110px',
      mobile: 'field',
      // A university with no programs can be recommended by nothing — it is
      // invisible to students. Worth spotting while scanning the catalog.
      cell: (item) =>
        item.programs_count === 0 ? (
          <span className={cn(ADMIN_NUM, 'text-danger')} title="Без программ вуз не попадёт в подбор ученику">
            0
          </span>
        ) : (
          <span className={cn(ADMIN_NUM, 'text-secondary')}>{item.programs_count}</span>
        ),
    },
    {
      key: 'updated',
      header: 'Правка',
      align: 'right',
      width: '108px',
      mobile: 'badge',
      headerTitle: 'Дата ручной правки из админки. Пусто — вуз только из сида, руками не трогали.',
      // Was "Обновлён" and rendered a dash on every row: `updated_at` is set
      // only by an admin PATCH and is null for the entire seeded catalog. A
      // column of 252 dashes is not a column; a mark on edited rows is.
      cell: (item) =>
        item.updated_at ? (
          <span className={cn(ADMIN_NUM, 'text-muted whitespace-nowrap')}>{formatDate(item.updated_at)}</span>
        ) : null,
    },
  ];

  return (
    <>
      <AdminListHeader
        title="Университеты"
        description="Каталог вузов и их программ. Это единственный раздел, где правки уходят в данные продукта напрямую."
      />

      <AdminToolbar
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: 'Название, город или аббревиатура',
        }}
        selects={[
          {
            key: 'country',
            label: 'Страна',
            value: country,
            options: countries.map((entry) => ({
              value: entry.country,
              label: `${entry.country} (${entry.universities_count})`,
            })),
          },
          {
            key: 'has_programs',
            label: 'Программы',
            value: hasPrograms,
            options: [
              { value: 'no', label: 'Без программ' },
              { value: 'yes', label: 'С программами' },
            ],
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      <AdminDataTable
        label="Университеты"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/universities/${item.id}`}
        loading={loading}
        sort={sort}
        onSortChange={setSort}
        emptyTitle="Университеты не найдены"
        emptyHint="Поиск матчит название, короткое имя, город и аббревиатуры. Попробуйте снять фильтр по стране."
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['вуз', 'вуза', 'вузов']} />
    </>
  );
}
