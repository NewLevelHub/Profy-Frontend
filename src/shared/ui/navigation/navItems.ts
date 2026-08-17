// Single source of truth for the app-shell nav items — previously duplicated
// between Sidebar.tsx (desktop) and Header.tsx (mobile). Both are now merged
// into TopRail.tsx, which is the only consumer of this list.
export const NAV_ITEMS = [
  { label: 'Главная', path: '/home', emoji: '🏠' },
  { label: 'Результаты', path: '/results', emoji: '📊' },
  { label: 'Профиль', path: '/profile', emoji: '👤' },
] as const;

export const ADMIN_NAV_ITEM = {
  label: 'Админка',
  path: '/admin/users',
  emoji: '⚙️',
  matchPrefix: '/admin',
} as const;

export type NavItem = (typeof NAV_ITEMS)[number] | typeof ADMIN_NAV_ITEM;

export function isNavActive(
  matchPrefix: string | undefined,
  pathname: string,
  isActive: boolean,
): boolean {
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return isActive;
}
