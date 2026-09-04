import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Remembers the query string a list was last viewed with, so a detail screen's
 * breadcrumb can return to that exact view.
 *
 * Filters and page live in the URL (`useAdminListParams`), which makes a
 * filtered list linkable — but a breadcrumb pointing at the bare
 * `/admin/users` still drops you back on page 1 with no filters. Working
 * through a filtered list one row at a time (the normal way this admin panel
 * gets used) meant re-applying filters after every single row.
 *
 * Browser Back already restores the view; this makes the in-page way back do
 * the same, for the many people who reach for the breadcrumb instead.
 *
 * Module-level and session-scoped on purpose: it is a navigation convenience,
 * not state worth persisting or syncing.
 */
const lastQueryByPath = new Map<string, string>();

/** Call from a list page: records its current query string under its path. */
export function useRememberListQuery(basePath: string) {
  const { search } = useLocation();

  useEffect(() => {
    lastQueryByPath.set(basePath, search);
  }, [basePath, search]);
}

/** Call from a detail page: the list path plus whatever filters it last had. */
export function listReturnPath(basePath: string): string {
  return `${basePath}${lastQueryByPath.get(basePath) ?? ''}`;
}
