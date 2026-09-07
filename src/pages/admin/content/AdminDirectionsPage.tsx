import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { adminApi } from '@/shared/api/admin';
import { useAdminListParams } from '@/shared/lib/useAdminListParams';
import { useRememberListQuery } from '@/shared/lib/listReturnPath';
import { AdminListHeader } from '@/shared/ui/admin/AdminListHeader';
import { AdminToolbar } from '@/shared/ui/admin/AdminToolbar';
import { AdminDataTable, type AdminColumn } from '@/shared/ui/admin/AdminDataTable';
import { AdminPager } from '@/shared/ui/admin/AdminPager';
import { AdminError } from '@/shared/ui/admin/AdminStates';
import { OverrideBadge } from '@/shared/ui/admin/OverrideBadge';
import { ADMIN_META, ADMIN_NUM } from '@/shared/ui/admin/density';
import type { AdminDirectionListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'catalog_filled'] as const;
/** Поля сортировки, которые принимает эндпоинт — незнакомое значение
 *  в URL игнорируется, а не улетает на сервер за 422. */
const SORTABLE_KEYS = ['name', 'holland_code', 'slug'] as const;

/** Русские имена полей каталога — список приходит машинными. */
const CATALOG_FIELD_LABELS: Record<string, string> = {
  description: 'описание',
  professions: 'профессии',
  skills_needed: 'навыки',
  subjects_to_develop: 'предметы',
  first_steps: 'первые шаги',
};

export default function AdminDirectionsPage() {
  const { page, values, sort, setSort, setFilter, setPage, clearFilters } =
    useAdminListParams(FILTER_KEYS, SORTABLE_KEYS);
  useRememberListQuery('/admin/content/directions');
  const [items, setItems] = useState<AdminDirectionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { search, catalog_filled: catalogFilled } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listDirections({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          catalog_filled: catalogFilled ? catalogFilled === 'yes' : undefined,
          sort: sort?.key,
          order: sort?.order,
        });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch {
        if (!cancelled) setError('Не удалось загрузить направления');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, catalogFilled, sort?.key, sort?.order, reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const columns: AdminColumn<AdminDirectionListItem>[] = [
    {
      key: 'name',
      header: 'Направление',
      sortKey: 'name',
      mobile: 'title',
      cell: (item) => (
        <Link
          to={`/admin/content/directions/${item.id}`}
          className="font-semibold text-primary hover:text-brand hover:underline"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: 'holland',
      // По-русски, как и все остальные заголовки: инструмент во всей админке
      // называется RIASEC, «Holland code» тут единственная латиница.
      header: 'Код RIASEC',
      sortKey: 'holland_code',
      width: '124px',
      mobile: 'field',
      headerTitle: 'Три ведущие буквы RIASEC, по которым направление подбирается ученику',
      cell: (item) => (
        <span className="font-mono text-mono-sm text-secondary tracking-wide">{item.holland_code}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      sortKey: 'slug',
      width: '248px',
      mobile: 'subtitle',
      headerTitle: 'Адрес направления в продукте. Не перегенерируется при правке названия',
      cell: (item) => (
        <span className="font-mono text-mono-xs text-muted" title={item.slug}>
          {item.slug}
        </span>
      ),
    },
    {
      key: 'programs',
      header: 'Программ',
      align: 'right',
      width: '104px',
      mobile: 'field',
      headerTitle:
        'Сколько программ вузов привязано к направлению. Ноль — направление никогда не попадёт в подбор',
      cell: (item) => (
        <span
          className={
            item.programs_count === 0 ? 'font-mono text-mono-sm text-danger tabular-nums' : ADMIN_NUM
          }
        >
          {item.programs_count}
        </span>
      ),
    },
    {
      // Каталог заполняется отдельным контент-проходом, и до сих пор пустое
      // поле было видно только внутри карточки. Строка называет, чего не
      // хватает, а не просто «не заполнено».
      key: 'gaps',
      header: 'Не заполнено',
      width: '220px',
      mobile: 'subtitle',
      cell: (item) =>
        item.empty_catalog_fields.length === 0 ? (
          <span className="text-muted">—</span>
        ) : (
          <span className={ADMIN_META}>
            {item.empty_catalog_fields
              .map((field) => CATALOG_FIELD_LABELS[field] ?? field)
              .join(', ')}
          </span>
        ),
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
        title="Направления"
        description="Карьерные направления, которые продукт подбирает по коду RIASEC."
      />

      <AdminToolbar
        search={{ value: search, onChange: handleSearch, placeholder: 'Название или slug' }}
        selects={[
          {
            key: 'catalog_filled',
            label: 'Каталог',
            value: catalogFilled,
            options: [
              { value: 'no', label: 'Есть пустые поля' },
              { value: 'yes', label: 'Заполнен полностью' },
            ],
          },
        ]}
        onFilterChange={(key, value) => setFilter(key as (typeof FILTER_KEYS)[number], value)}
        onClearAll={clearFilters}
      />

      {error && <AdminError message={error} onRetry={() => setReloadToken((t) => t + 1)} />}

      <AdminDataTable
        label="Направления"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        rowHref={(item) => `/admin/content/directions/${item.id}`}
        sort={sort}
        onSortChange={setSort}
        loading={loading}
        emptyTitle="Направления не найдены"
        emptyHint="Поиск матчит название и slug направления."
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['направление', 'направления', 'направлений']} />
    </>
  );
}
