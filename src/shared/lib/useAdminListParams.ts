import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

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
    });
  }, [write, keys]);

  const activeCount = keys.reduce((n, key) => (searchParams.get(key) ? n + 1 : n), 0);

  return { page, values, setFilter, setFilters, setPage, clearFilters, activeCount };
}
