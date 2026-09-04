import { useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { pluralize } from '@/shared/lib/plural';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn, type AdminSort } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { ADMIN_META, ADMIN_NUM, ADMIN_TEXT } from '@/shared/ui/admin/density';
import { countryOptions, useUniversityCatalog } from './useUniversityCatalog';
import type { AdminUniversityListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'country', 'sort', 'order'] as const;

const HOME_COUNTRY = 'Казахстан';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').trim();
}

/** Missing ranks sort last in both directions — an absent rank is not a rank of 0. */
function compareNullableNumber(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

export default function AdminUniversitiesPage() {
  const { page, values, setFilter, setFilters, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  useRememberListQuery('/admin/universities');

  const { items, loading, error, truncated, reload } = useUniversityCatalog();
  const { search, country, sort: sortKey, order } = values;

  const sort: AdminSort = { key: sortKey || 'name', order: order === 'desc' ? 'desc' : 'asc' };

  const filtered = useMemo(() => {
    const query = normalize(search);
    const matched = items.filter((item) => {
      if (country && item.country !== country) return false;
      if (!query) return true;
      // Matches the city as well, which the server-side `search` cannot do —
      // "не находит по городу" was the standing complaint about this screen.
      return normalize(item.name).includes(query) || normalize(item.city ?? '').includes(query);
    });

    const direction = sort.order === 'asc' ? 1 : -1;
    return [...matched].sort((a, b) => {
      switch (sort.key) {
        case 'programs':
          return (a.programs_count - b.programs_count) * direction;
        case 'ranking':
          return compareNullableNumber(a.ranking, b.ranking) * direction;
        case 'uniranks':
          return compareNullableNumber(a.uniranks_kz_rank, b.uniranks_kz_rank) * direction;
        default:
          // Cyrillic-aware, unlike the server's default ordering, which put all
          // Latin-named universities first and pushed the 111 Kazakh ones to
          // page six of thirteen.
          return a.name.localeCompare(b.name, 'ru') * direction;
      }
    });
  }, [items, search, country, sort.key, sort.order]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const countries = useMemo(() => countryOptions(items), [items]);
  const withoutPrograms = filtered.filter((item) => item.programs_count === 0).length;

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  function handleSortChange(next: AdminSort) {
    setFilters({ sort: next.key, order: next.order });
  }

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
    // The model warns this column mixes scales — a global QS position, a
    // national tier and a category rank all land in one Integer, so 32 and 248
    // are not comparable. The verbatim source string lives in `ranking_label`,
    // absent from the list response — docs/admin-backend-requests-pro-242.md §12.
    headerTitle:
      'Значения из разных источников (мировые, национальные, отраслевые) и между собой не сравнимы. Расшифровка — в карточке вуза.',
    cell: (item) =>
      item.ranking != null ? (
        <span className={cn(ADMIN_NUM, 'text-secondary')}>{item.ranking}</span>
      ) : (
        <span className={ADMIN_META}>—</span>
      ),
  };

  const uniranksColumn: AdminColumn<AdminUniversityListItem> = {
    key: 'uniranks',
    header: 'Uniranks KZ',
    sortKey: 'uniranks',
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
      sortKey: 'programs',
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
        search={{ value: search, onChange: handleSearch, placeholder: 'Название или город' }}
        selects={[{ key: 'country', label: 'Страна', value: country, options: countries }]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={reload} />}

      {truncated && (
        <AdminError message="Каталог не поместился целиком — фильтр по стране и сортировка охватывают только первые 2000 вузов." />
      )}

      {withoutPrograms > 0 && (
        <p className={cn(ADMIN_META, 'm-0')}>
          {pluralize(withoutPrograms, 'вуз', 'вуза', 'вузов')} без программ — они не попадут в подбор ученику.
        </p>
      )}

      <AdminDataTable
        label="Университеты"
        columns={columns}
        rows={pageItems}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/universities/${item.id}`}
        loading={loading}
        sort={sort}
        onSortChange={handleSortChange}
        emptyTitle="Университеты не найдены"
        emptyHint="Поиск ищет по названию и городу. Попробуйте снять фильтр по стране."
      />

      <AdminPager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['вуз', 'вуза', 'вузов']} />
    </>
  );
}
