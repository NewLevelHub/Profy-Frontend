import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { AdminSort } from '@/shared/ui/admin/AdminDataTable';

/** Sort lives in the URL next to the filters, but is deliberately NOT one of
 *  them: "сбросить фильтры" must not silently reorder the table, and the
 *  "N фильтров" counter must not tick up because a column header was
 *  clicked. Hence its own reserved keys, excluded from both. */
const SORT_KEY = 'sort';
const ORDER_KEY = 'order';

/**
 * List state (page + filters) kept in the URL rather than in `useState`.
 *
 * Before PRO-242 every admin list held its filters in component state, so a
 * filtered view could not be linked, bookmarked or reloaded — hitting refresh
 * on "in-progress juniors" dropped you back to the unfiltered first page. The
 * URL is the natural place for this: it makes the view shareable, makes the
 * back button behave, and removes the "which of these five useStates resets
 * the page number" bug class (changing any filter resets `page` here, once).
 *
 * Only non-empty values are written, so a pristine list stays at a clean
 * `/admin/users` with no query string.
 *
 * Sorting is handled here too (`sort`/`setSort`), so every list spells it the
 * same way the API does — `?sort=<field>&order=asc|desc`.
 */
export function useAdminListParams<K extends string>(keys: readonly K[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const values = useMemo(
    () => Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? ''])) as Record<K, string>,
    // `searchParams` is a fresh object each render but `.toString()` is stable
    // for equal query strings — keying off it avoids re-deriving every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString(), keys],
  );

  const write = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      // Filter changes replace history: a filter row is a view, not a
      // navigation step — otherwise Back walks through every keystroke.
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setFilter = useCallback(
    (key: K, value: string) => {
      write((next) => {
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete('page');
      });
    },
    [write],
  );

  /**
   * Several keys in one write.
   *
   * Two `setFilter` calls in the same handler both read the `searchParams`
   * captured by this render, so the second one overwrites the first: sorting
   * did `setFilter('sort', …)` then `setFilter('order', …)` and only `order`
   * survived, which silently sorted every list by its default column instead
   * of the one whose header was clicked.
   */
  const setFilters = useCallback(
    (patch: Partial<Record<K, string>>) => {
      write((next) => {
        for (const [key, value] of Object.entries(patch) as [K, string][]) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        next.delete('page');
      });
    },
    [write],
  );

  /**
   * Current sort, or undefined when the list is in its default order.
   *
   * `order` alone is meaningless, so a URL carrying one without a `sort` is
   * treated as unsorted rather than as an ascending sort of nothing.
   */
  const sort = useMemo<AdminSort | undefined>(() => {
    const key = searchParams.get(SORT_KEY);
    if (!key) return undefined;
    return { key, order: searchParams.get(ORDER_KEY) === 'desc' ? 'desc' : 'asc' };
  }, [searchParams]);

  /**
   * Both keys in ONE write.
   *
   * Two separate writes would each start from the `searchParams` of this
   * render, so the second would drop the first — the bug `setFilters` exists
   * to prevent, and sorting is exactly where it bit.
   */
  const setSort = useCallback(
    (next: AdminSort) => {
      write((params) => {
        params.set(SORT_KEY, next.key);
        params.set(ORDER_KEY, next.order);
        // A reorder starts from the top: page 3 of the old order describes
        // nothing in the new one.
        params.delete('page');
      });
    },
    [write],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      write((next) => {
        if (nextPage > 1) next.set('page', String(nextPage));
        else next.delete('page');
      });
    },
    [write],
  );

  const clearFilters = useCallback(() => {
    write((next) => {
      for (const key of keys) next.delete(key);
      next.delete('page');
      // Sort survives on purpose — see SORT_KEY above.
    });
  }, [write, keys]);

  const activeCount = keys.reduce((n, key) => (searchParams.get(key) ? n + 1 : n), 0);

  return { page, values, sort, setSort, setFilter, setFilters, setPage, clearFilters, activeCount };
}
