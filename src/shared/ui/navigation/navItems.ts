// Single source of truth for the app-shell nav items — previously duplicated
// between Sidebar.tsx (desktop) and Header.tsx (mobile). Both are now merged
// into TopRail.tsx, which is the only consumer of this list.
export const NAV_ITEMS = [
  { label: 'Результаты', path: '/results' },
  // 'План' (/roadmap) hidden from nav for now — route still exists, just not linked.
  { label: 'Профиль', path: '/profile' },
] as const;

export const ADMIN_NAV_ITEM = {
  label: 'Админка',
  path: '/admin/users',
  matchPrefix: '/admin',
} as const;

export const PSYCHOLOGIST_NAV_ITEMS = [
  {
    label: 'Ученики',
    path: '/psychologist/students',
    matchPrefix: '/psychologist',
  },
] as const;

export type NavItem =
  | (typeof NAV_ITEMS)[number]
  | typeof ADMIN_NAV_ITEM
  | (typeof PSYCHOLOGIST_NAV_ITEMS)[number];

export function isNavActive(
  matchPrefix: string | undefined,
  pathname: string,
  isActive: boolean,
): boolean {
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return isActive;
}
