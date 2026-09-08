import type { Location } from 'react-router';

/**
 * Куда человек шёл, когда его перехватила гварда.
 *
 * Раньше этим владел только LoginPage: гварды клали в `state.from` целый
 * объект Location, а форма читала его как строку. Работало по совпадению
 * (у Location есть pathname/search/hash, а `navigate` принимает такой
 * объект), но результата всё равно не давало — сразу после входа
 * RequireGuest перерисовывался с новым токеном и его собственный
 * `<Navigate to="/results">` перебивал переход формы. Поэтому адрес
 * назначения теперь один на всех: и форма, и гварда читают его отсюда и
 * приходят к одному и тому же выводу, кто бы из них ни сработал первым.
 */

/** `state.from` в том виде, в каком его кладут гварды. */
export interface ReturnToState {
  from?: string;
}

export function toPath(location: Location): string {
  return `${location.pathname}${location.search}${location.hash}`;
}

/**
 * Внутренний путь и только он: `next` приходит из адресной строки, а
 * «//evil.com» и «https://evil.com» браузер считает абсолютным адресом —
 * без этой проверки форма логина стала бы открытым редиректом.
 */
function isInternalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}

/**
 * Адрес назначения из состояния навигации (переход внутри приложения) или
 * из `?next=` (жёсткий редирект из перехватчика 401 — там React уже не
 * работает и передать state нечем).
 */
export function resolveReturnTo(location: Location): string | null {
  const fromState = (location.state as ReturnToState | null)?.from;
  if (typeof fromState === 'string' && isInternalPath(fromState)) return fromState;

  const next = new URLSearchParams(location.search).get('next');
  if (next && isInternalPath(next)) return next;

  return null;
}
