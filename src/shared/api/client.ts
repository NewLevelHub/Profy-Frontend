import axios from 'axios';
import { env } from '@/shared/config/env';
import { resetUserSession } from '@/shared/lib/session';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Read token from zustand-persist storage to avoid circular import.
function getToken(): string | null {
  try {
    const raw = localStorage.getItem('profy-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only force-logout on 401 if the user had an active session.
    // A 401 on the login endpoint itself must reach the form's catch block.
    if (error.response?.status === 401 && getToken()) {
      resetUserSession();
      localStorage.removeItem('profy-auth');
      // Здесь React уже не работает — состояние навигации передать нечем,
      // поэтому адрес, на котором человека застала протухшая сессия,
      // уезжает в сам URL. Форма логина читает его тем же
      // resolveReturnTo, что и `state.from` при обычном перехвате гвардой,
      // и после повторного входа возвращает человека на прежний экран,
      // а не на /results.
      const here = window.location.pathname + window.location.search + window.location.hash;
      const next = here.startsWith('/login') ? '' : `?next=${encodeURIComponent(here)}`;
      window.location.replace(`/login${next}`);
    }
    return Promise.reject(error);
  },
);
