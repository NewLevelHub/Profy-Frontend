import { useEffect, useState } from 'react';
import { adminApi } from '@/shared/api/admin';
import type { AdminFeedbackListItem } from '@/shared/types';

/** The endpoint's own ceiling (`limit: le=100`). */
const PAGE_LIMIT = 100;

/**
 * Ten requests, then stop. Feedback grows with users, unlike the university
 * catalog, so this needs a hard floor under it — past this the screen degrades
 * to "the newest 1000", which it says out loud, instead of quietly firing
 * fifty requests.
 */
const MAX_ITEMS = 1000;

interface FeedbackFeed {
  items: AdminFeedbackListItem[];
  /** Everything the server has, even when only `MAX_ITEMS` were loaded. */
  total: number;
  loading: boolean;
  error: string;
  /** True when the feed outgrew `MAX_ITEMS` and only the newest slice is here. */
  truncated: boolean;
  reload: () => void;
}

/**
 * Loads the feedback list in full, newest first.
 *
 * Why not ask the server: `GET /admin/feedback` takes `page` and `limit` and
 * nothing else — no score filter, no age filter, no section filter, no search,
 * no sort (docs/admin-backend-requests-pro-242.md §3). "Show me every review
 * that scored 1–2" is the entire reason an admin opens this screen, and it was
 * simply not answerable; the previous version admitted as much with a line of
 * grey text on the page saying filters were waiting on the API.
 *
 * Two things make loading everything defensible here rather than a hack:
 *
 * 1. `GET /admin/feedback/stats` already selects **all** feedback rows and
 *    enriches them in Python on every call — the backend has itself decided
 *    this table is small enough to walk end to end. This page makes the same
 *    call it was making before, in pages.
 * 2. The rows come back ordered `created_at DESC`, so a truncated load is
 *    "the newest 1000 reviews" — a slice with a name, not an arbitrary prefix.
 *
 * Because the whole set is here, the summary above the table is computed from
 * the same rows the table shows, by the same grouping the backend's `_breakdown`
 * uses — so the two can never disagree, and the summary can follow the filters.
 *
 * Delete this the moment `/admin/feedback` grows filters and `?sort=`.
 */
export function useFeedbackFeed(): FeedbackFeed {
  const [items, setItems] = useState<AdminFeedbackListItem[]>([]);
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
        const first = await adminApi.listFeedback({ page: 1, limit: PAGE_LIMIT });
        if (cancelled) return;

        const reachable = Math.min(first.total, MAX_ITEMS);
        const pageCount = Math.ceil(reachable / PAGE_LIMIT);

        const rest = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
            adminApi.listFeedback({ page: index + 2, limit: PAGE_LIMIT }),
          ),
        );
        if (cancelled) return;

        setItems([...first.items, ...rest.flatMap((response) => response.items)]);
        setTotal(first.total);
        setTruncated(first.total > MAX_ITEMS);
      } catch {
        if (!cancelled) setError('Не удалось загрузить фидбэк');
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
