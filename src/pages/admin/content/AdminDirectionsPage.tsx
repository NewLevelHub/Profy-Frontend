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
import type { AdminDirectionListItem } from '@/shared/types';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search'] as const;

export default function AdminDirectionsPage() {
  const { page, values, setFilter, setPage, clearFilters } = useAdminListParams(FILTER_KEYS);
  useRememberListQuery('/admin/content/directions');
  const [items, setItems] = useState<AdminDirectionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const { search } = values;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listDirections({ page, limit: PAGE_SIZE, search: search || undefined });
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
  }, [page, search, reloadToken]);

  const handleSearch = useCallback((value: string) => setFilter('search', value), [setFilter]);

  const columns: AdminColumn<AdminDirectionListItem>[] = [
    {
      key: 'name',
      header: 'Направление',
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
        search={{ value: search, onChange: handleSearch, placeholder: 'Название направления' }}
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
        loading={loading}
        emptyTitle="Направления не найдены"
        emptyHint="Поиск матчит название направления."
      />

      <AdminPager page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} noun={['направление', 'направления', 'направлений']} />
    </>
  );
}
