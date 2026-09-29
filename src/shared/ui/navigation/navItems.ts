// Single source of truth for the app-shell nav items — previously duplicated
// between Sidebar.tsx (desktop) and Header.tsx (mobile). Both are now merged
// into TopRail.tsx, which is the only consumer of this list. `label` holds an
// i18n key (common namespace) — TopRail resolves it with `t()`.
export const NAV_ITEMS = [
  { label: 'common:nav.results', path: '/results' },
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

/** Staff cabinet nav — no student tabs (results / start test). The review
 *  queue comes first: it is where the psychologist's work starts. */
export const PSYCHOLOGIST_NAV_ITEMS = [
  {
    label: 'psychologist:nav.reviews',
    path: '/psychologist/reviews',
    matchPrefix: '/psychologist/reviews',
    counter: 'psychologistReviews',
  },
  {
    label: 'psychologist:nav.students',
    path: '/psychologist/students',
    matchPrefix: '/psychologist/students',
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
  const reportRoute = /^\/psychologist\/students\/[^/]+\/assessments\/[^/]+\/report(?:\/|$)/.test(pathname);
  if (reportRoute && matchPrefix === '/psychologist/reviews') return true;
  if (reportRoute && matchPrefix === '/psychologist/students') return false;
  if (matchPrefix) return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`);
  return isActive;
}
