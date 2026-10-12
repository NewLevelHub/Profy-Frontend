import { API } from '@/shared/api/endpoints';
import { env } from '@/shared/config/env';

/**
 * Tell the server the session is over, so the token stops working there too
 * — clearing it from this browser alone leaves any copy of it valid until it
 * expires.
 *
 * Plain `fetch`, not `apiClient`: the auth store calls this while it is
 * clearing itself, and the axios client reads the token back out of that
 * store (and imports it). The token is passed in explicitly for the same
 * reason. `keepalive` lets the request finish if the page navigates away.
 *
 * Best effort by design: signing out must work offline too, so a failed
 * request is not surfaced — the token then simply lives out its lifetime.
 */
export function revokeSession(token: string): void {
  const url = `${env.API_URL.replace(/\/$/, '')}${API.auth.logout}`;
  void fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    keepalive: true,
  }).catch(() => undefined);
}
