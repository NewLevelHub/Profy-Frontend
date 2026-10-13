import axios from 'axios';
import { env } from '@/shared/config/env';
import { useAuthStore } from '@/shared/store/auth';
import { readPersistedLocale } from '@/shared/store/locale';
import { readStoredSession, syncSessionFromStorage } from '@/shared/lib/sessionSync';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Read the persisted token so requests made during Zustand hydration still
// carry the existing session.
export function readAccessToken(): string | null {
  return readStoredSession().token;
}

apiClient.interceptors.request.use((config) => {
  const token = readAccessToken();
  const auth = useAuthStore.getState();
  // Another tab signed in or out and this one has not caught up yet: the
  // stored token belongs to a different session than what is on screen, so
  // the request must not go out with it.
  if (auth._hasHydrated && token !== auth.token && syncSessionFromStorage()) {
    throw new axios.CanceledError('session changed in another tab');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Every request carries the UI locale; the backend resolves ru/kk from this
  // (and from users.locale for authenticated calls). See docs/i18n.md.
  config.headers['Accept-Language'] = readPersistedLocale();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only force-logout on 401 if the user had an active session.
    // A 401 on the login endpoint itself must reach the form's catch block.
    // The in-memory token counts too: if another tab cleared the stored one,
    // this tab still shows a session that the server no longer accepts.
    if (error.response?.status === 401 && (readAccessToken() || useAuthStore.getState().token)) {
      // Use the exact same logout path as every UI entry point. It clears the
      // in-memory auth state, persisted auth, all private stores, drafts and
      // the complete React Query cache before navigation. Without the server
      // call: this token is the one the server has just refused.
      useAuthStore.getState().logout({ revoke: false });
      // Здесь React уже не работает — состояние навигации передать нечем,
      // поэтому адрес, на котором человека застала протухшая сессия,
      // уезжает в сам URL. Форма логина читает его тем же
      // resolveReturnTo, что и `state.from` при обычном перехвате гвардой,
      // и после повторного входа возвращает человека на прежний экран,
      // а не на /results. Без фрагмента: `?next=` уходит на сервер и в его
      // логи, а во фрагменте может лежать секрет (токен в /invite#token=…).
      const here = window.location.pathname + window.location.search;
      const next = here.startsWith('/login') ? '' : `?next=${encodeURIComponent(here)}`;
      window.location.replace(`/login${next}`);
    }
    return Promise.reject(error);
  },
);

/**
 * `error_code` from an AppError response (`{detail, error_code}` — see the
 * backend's main.py handler), or null for anything else: a plain
 * HTTPException, a network failure, a thrown Error.
 *
 * The code is what a screen should branch on, never the ru `detail` text.
 */
export function apiErrorCode(error: unknown): string | null {
  const code = (error as { response?: { data?: { error_code?: unknown } } })?.response?.data?.error_code;
  return typeof code === 'string' ? code : null;
}
