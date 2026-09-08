import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import type { AxiosError } from 'axios';

/**
 * Профиль там, где на него нельзя рассчитывать.
 *
 * Стор профиля не персистится и наполняется гвардой RequireProfile.
 * Экраны онбординга и визарда лежат вне этой гварды, и каждый из них
 * доступен по прямой ссылке и переживает F5 — значит на холодной
 * загрузке профиль там просто пуст, и никто его не запрашивает.
 *
 * Молчаливое «профиля нет» уже стоило трёх ошибок: человека с готовым
 * профилем отбрасывало на первый шаг онбординга, middle попадал на
 * junior-экран пар, а /assessment/motivation выбирал формат опросника
 * по возрасту и после обновления страницы показывал старшекласснику
 * младший инструмент.
 *
 * Поэтому: если стор пуст — спрашиваем сервер тем же ключом запроса, что
 * и RequireProfile (кэш общий, лишнего запроса не будет), и отдаём флаг
 * ожидания. Пока он поднят, решений на основе профиля принимать нельзя.
 */
export function useEnsureProfile() {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId] as const,
    queryFn: () =>
      profileApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    enabled: Boolean(userId) && profile === null,
    retry: false,
  });

  useEffect(() => {
    if (data) setProfile(data);
  }, [data, setProfile]);

  return { profile: profile ?? data ?? null, isLoading };
}
