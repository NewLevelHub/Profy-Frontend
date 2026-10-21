// Single source of truth for the app-shell nav items, read by the student
// and psychologist navigations. `label` holds an i18n key — the navigation
// resolves it with `t()`.
export const NAV_ITEMS = [
  { label: 'common:nav.results', path: '/results' },
  { label: 'common:nav.universities', path: '/universities' },
  { label: 'common:nav.profile', path: '/profile' },
] as const;

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
  {
    label: 'psychologist:nav.schedule',
    path: '/psychologist/schedule',
    matchPrefix: '/psychologist/schedule',
  },
] as const;

/** The owner's part of the cabinet: every specialist's schedule (ТЗ §4.1).
 *  The rest of the psychologist API is psychologist-only. */
export const OWNER_NAV_ITEMS = [
  {
    label: 'psychologist:nav.schedule',
    path: '/psychologist/schedule',
    matchPrefix: '/psychologist/schedule',
  },
] as const;

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
