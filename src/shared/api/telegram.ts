import { apiClient } from '@/shared/api/client';
import { API } from '@/shared/api/endpoints';

/** The specialist's Telegram for call reminders. `enabled: false` — the bot is not set up yet. */
export interface TelegramState {
  enabled: boolean;
  linked: boolean;
  linked_at: string | null;
}

export const telegramKeys = {
  me: ['telegram', 'me'] as const,
};

export const telegramApi = {
  me: () => apiClient.get<TelegramState>(API.telegram.me).then((r) => r.data),
  /** A one-time t.me link; opening it and pressing «Старт» ties the chat. */
  link: () => apiClient.post<{ url: string }>(API.telegram.link).then((r) => r.data.url),
  unlink: () => apiClient.delete(API.telegram.me).then(() => undefined),
};
