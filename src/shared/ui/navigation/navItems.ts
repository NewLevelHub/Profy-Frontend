// Single source of truth for the app-shell nav items — previously duplicated
// between Sidebar.tsx (desktop) and Header.tsx (mobile). Both are now merged
// into TopRail.tsx, which is the only consumer of this list. `label` holds an
// i18n key (common namespace) — TopRail resolves it with `t()`.
export const NAV_ITEMS = [
  { label: 'common:nav.results', path: '/results' },
  // 'План' (/roadmap) hidden from nav for now — route still exists, just not linked.
  // matchPrefix keeps the tab lit on /universities/:id, which NavLink's own
  // `isActive` would drop (it matches the exact path only for a nav item
  // whose route has children).
  { label: 'common:nav.universities', path: '/universities', matchPrefix: '/universities' },
  { label: 'common:nav.profile', path: '/profile' },
] as const;

export const ADMIN_NAV_ITEM = {
  label: 'common:nav.admin',
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
