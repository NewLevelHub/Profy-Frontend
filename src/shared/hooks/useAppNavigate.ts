import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '@/app/routes';

type ParentResolver = [pattern: RegExp, resolve: (match: RegExpMatchArray) => string];

// "Up" targets for pages that are only ever reached by drilling down from a
// section root (never linked directly from the sidebar) — used as the
// goBack() fallback when there's no in-app history entry to pop to. That
// happens for a bookmarked/shared deep link, or right after a sidebar click
// (sidebar navigation always replaces history — see Sidebar/Header — so
// there's nothing between "now" and whatever page was open before the user
// touched the sidebar at all).
const PARENT_ROUTES: ParentResolver[] = [
  [/^\/results\/directions\/([^/]+)\/universities\/[^/]+\/gap$/, (m) => ROUTES.universityList(m[1])],
  [/^\/results\/directions\/([^/]+)\/universities\/[^/]+$/, (m) => ROUTES.universityList(m[1])],
  [/^\/results\/directions\/[^/]+\/(?:roadmap|feedback|universities|subject-readiness)$/, () => ROUTES.results],
  [/^\/assessment\/known-profession\/([^/]+)\/[^/]+$/, (m) => ROUTES.knownProfessionList(m[1])],
  [/^\/assessment\/known-profession\/[^/]+$/, () => ROUTES.knownProfessionSpheres],
  [/^\/admin\/users\/[^/]+$/, () => ROUTES.adminUsers],
];

function resolveParentRoute(pathname: string): string {
  for (const [pattern, resolve] of PARENT_ROUTES) {
    const match = pathname.match(pattern);
    if (match) return resolve(match);
  }
  return ROUTES.home;
}

/** navigate() plus a goBack() that understands app structure, for use by
 * BackButton and anything else that needs a "logical up" action instead of
 * the raw browser history stack. Sidebar/tab-switch navigations never push a
 * history entry (see Sidebar/Header), so plain `navigate(-1)` alone would
 * either skip past them correctly (good) or, on a page opened via direct
 * link, exit the app entirely (bad) — goBack() falls back to a resolved
 * parent route in that second case instead. */
export function useAppNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    // history.state.idx is set by react-router's own history stack, counting
    // up on every push from this app session — 0 (or unset) means there's
    // nothing in this session to pop back to.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(resolveParentRoute(location.pathname), { replace: true });
    }
  }

  return { navigate, goBack };
}
