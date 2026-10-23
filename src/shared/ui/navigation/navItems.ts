// Single source of truth for the app-shell nav items, read by the student
// and psychologist navigations. `label` holds an i18n key — the navigation
// resolves it with `t()`.
export const NAV_ITEMS = [
  { label: 'common:nav.results', path: '/results' },
  { label: 'common:nav.universities', path: '/universities' },
  { label: 'common:nav.profile', path: '/profile' },
] as const;

/** Staff cabinet nav — no student tabs (results / start test). «Созвоны»
 *  comes first: calls to mark and the coming ones. Reports waiting for review
 *  are counted on «Мои ученики» — they open from the student card. */
export const PSYCHOLOGIST_NAV_ITEMS = [
  {
    label: 'psychologist:nav.calls',
    path: '/psychologist/calls',
    matchPrefix: '/psychologist/calls',
  },
  {
    label: 'psychologist:nav.students',
    path: '/psychologist/students',
    matchPrefix: '/psychologist/students',
    counter: 'psychologistReviews',
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
  if (matchPrefix) return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`);
  return isActive;
}
