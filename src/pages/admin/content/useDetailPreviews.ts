import { useEffect, useState } from 'react';

/** Browsers give ~6 connections per host anyway; queueing to that keeps the
 *  page turn from opening twenty sockets at once. */
const CONCURRENCY = 6;

/** Session cache per entity — content-bank rows don't change while you page. */
const caches = new Map<string, Map<string, unknown>>();

function cacheFor<T>(namespace: string): Map<string, T> {
  let cache = caches.get(namespace);
  if (!cache) {
    cache = new Map();
    caches.set(namespace, cache);
  }
  return cache as Map<string, T>;
}

/**
 * Fills a list's rows in from their detail responses.
 *
 * Two content lists return rows with no text on them at all — question pairs
 * (`id`, `instrument`, `age_tier`, `pair_index`, `has_overrides`) and
 * motivation pairs (`id`, `pair_index`, `category_a`, `category_b`,
 * `has_overrides`). Both rendered as "Пара #12" over and over: lists you can
 * only count through, not read. What each row actually says lives in its
 * detail response.
 *
 * So the list hydrates itself: one detail request per row **of the visible
 * page**, a few at a time, cached for the session. That is an N+1, and it is
 * only tolerable because these banks are 67 and 18 rows and the screen is
 * admin-only. Rows render and link correctly before the text arrives — the
 * preview is an enhancement, never a blocker, and a row that fails to load
 * just shows no preview.
 *
 * Delete this the moment those list responses carry their own text —
 * docs/admin-backend-requests-pro-242.md §13.
 */
export function useDetailPreviews<T>(
  namespace: string,
  ids: readonly string[],
  load: (id: string) => Promise<T>,
): Map<string, T> {
  const cache = cacheFor<T>(namespace);
  const [previews, setPreviews] = useState<Map<string, T>>(new Map(cache));

  const key = ids.join(',');

  useEffect(() => {
    let cancelled = false;
    const missing = ids.filter((id) => !cache.has(id));
    if (missing.length === 0) {
      setPreviews(new Map(cache));
      return;
    }

    async function hydrate() {
      for (let index = 0; index < missing.length; index += CONCURRENCY) {
        const batch = missing.slice(index, index + CONCURRENCY);
        const loaded = await Promise.all(
          batch.map((id) =>
            load(id)
              .then((value) => ({ id, value }))
              .catch(() => null),
          ),
        );
        if (cancelled) return;
        for (const entry of loaded) {
          if (entry) cache.set(entry.id, entry.value);
        }
        setPreviews(new Map(cache));
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return previews;
}
