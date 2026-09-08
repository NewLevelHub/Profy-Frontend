/**
 * Тема оформления: выбор пользователя и его применение к документу.
 *
 * Тёмная тема включается классом `dark` на <html> (`@variant dark` в
 * tailwind.css), а сами значения живут в `styles/theme.css` — здесь только
 * решение, какой из двух наборов сейчас активен.
 *
 * Три состояния, а не два: «как в системе» — это отдельный выбор, а не
 * отсутствие выбора. Пользователь, у которого система переключается по
 * расписанию, должен получать то же самое поведение и в продукте, поэтому
 * при `system` мы подписываемся на смену prefers-color-scheme.
 *
 * Первое применение делает встроенный скрипт в index.html — до первой
 * отрисовки, иначе тёмная тема моргала бы светлым кадром на каждой загрузке.
 * Ключ хранилища и логика выбора должны совпадать с этим скриптом.
 */

export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'profy-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Цвет шапки браузера на телефоне — холст активной темы (--fog). */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#EDE9DF',
  dark: '#111A18',
};

function isChoice(value: unknown): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isChoice(stored) ? stored : 'system';
  } catch {
    // Приватный режим и заблокированные куки: выбор просто не переживёт
    // перезагрузку, но интерфейс должен работать.
    return 'system';
  }
}

export function systemTheme(): ResolvedTheme {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  return choice === 'system' ? systemTheme() : choice;
}

function applyToDocument(theme: ResolvedTheme) {
  document.documentElement.classList.add('theme-crossfade');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  // meta с media покрывает только системную тему; при явном выборе шапку
  // браузера надо перекрасить руками, иначе она останется бежевой.
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLOR[theme]));
  window.setTimeout(() => {
    document.documentElement.classList.remove('theme-crossfade');
  }, 320);
}

const listeners = new Set<() => void>();
let choice: ThemeChoice = 'system';

function notify() {
  listeners.forEach((listener) => listener());
}

export function setThemeChoice(next: ThemeChoice) {
  choice = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // См. readChoice: выбор не сохранится, но применится к текущей сессии.
  }
  applyToDocument(resolveTheme(next));
  notify();
}

export function getThemeChoice(): ThemeChoice {
  return choice;
}

/** Подписка для useSyncExternalStore. */
export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Вызывается один раз при старте приложения. */
export function initTheme() {
  choice = readChoice();
  applyToDocument(resolveTheme(choice));

  if (typeof matchMedia !== 'function') return;
  matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (choice !== 'system') return;
    applyToDocument(systemTheme());
    notify();
  });
}
