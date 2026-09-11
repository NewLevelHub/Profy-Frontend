import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/**
 * Экранная кнопка «Назад» на детальных экранах.
 *
 * `navigate(-1)` — это «шаг назад по истории браузера», а не «на
 * родительский экран», и разница видна ровно тогда, когда истории нет:
 * человек открыл ссылку из мессенджера, вернулся из письма, обновил
 * страницу. Тогда шаг назад уводит с сайта — проверено, вкладка уходила
 * на about:blank.
 *
 * Поэтому решение принимается по `idx` из состояния истории: react-router
 * нумерует им свои записи, и `idx === 0` означает, что текущий экран —
 * первый в этой вкладке и возвращаться внутри приложения некуда. В этом
 * случае уходим на родительский экран через `replace`, чтобы не плодить
 * запись в истории; в остальных случаях обычный шаг назад, который
 * возвращает человека ровно туда, откуда он пришёл.
 */
export function useBackTo(parentPath: string) {
  const navigate = useNavigate();

  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(parentPath, { replace: true });
  }, [navigate, parentPath]);
}
