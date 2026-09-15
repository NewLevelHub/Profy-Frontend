import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/shared/api/admin';
import type { AdminUniversityListItem } from '@/shared/types';

/** The endpoint's own ceiling (`limit: le=100`). */
const PAGE_LIMIT = 100;

/**
 * Refuse to hoover up an unbounded catalog. At 252 universities today this is
 * three requests; if the catalog ever passes this, the page degrades to plain
 * server paging rather than silently issuing 50 requests.
 */
const MAX_ITEMS = 2000;

interface Catalog {
  items: AdminUniversityListItem[];
  total: number;
  loading: boolean;
  error: string;
  /** True when the catalog outgrew `MAX_ITEMS` and only the first slice is here. */
  truncated: boolean;
  reload: () => void;
}

/**
 * Loads the whole university catalog once, so filtering, sorting and search can
 * happen on the complete set.
 *
 * Why not ask the server: `GET /admin/universities` takes only `page`, `limit`
 * and a `search` that matches `University.name` — no country filter, no sort,
 * no city matching (docs/admin-backend-requests-pro-242.md §1–§3, §12). Doing
 * any of those on a server page of 20 rows would filter a fifteenth of the
 * data while presenting itself as filtering the catalog, which is worse than
 * not offering them.
 *
 * The catalog is small and bounded in a way user tables are not — a country
 * has a finite number of universities — so fetching all of it is a reasonable
 * stopgap, and it buys three things the server can't currently do: search that
 * also matches the city, a country filter, and column sorting.
 *
 * This should be deleted the moment the endpoint grows `?country=` and
 * `?sort=`; it is a workaround, not an architecture.
 */
export function useUniversityCatalog(): Catalog {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState<AdminUniversityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [truncated, setTruncated] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const first = await adminApi.listUniversities({ page: 1, limit: PAGE_LIMIT });
        if (cancelled) return;

        const reachable = Math.min(first.total, MAX_ITEMS);
        const pageCount = Math.ceil(reachable / PAGE_LIMIT);

        const rest = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
            adminApi.listUniversities({ page: index + 2, limit: PAGE_LIMIT }),
          ),
        );
        if (cancelled) return;

        setItems([...first.items, ...rest.flatMap((response) => response.items)]);
        setTotal(first.total);
        setTruncated(first.total > MAX_ITEMS);
      } catch {
        if (!cancelled) setError(t('universities.loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { items, total, loading, error, truncated, reload: () => setReloadToken((t) => t + 1) };
}

/** Countries present in the catalog, most-populated first, with their counts. */
export function countryOptions(items: readonly AdminUniversityListItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.country) counts.set(item.country, (counts.get(item.country) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .map(([country, count]) => ({ value: country, label: `${country} (${count})` }));
}
