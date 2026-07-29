export type NavItemId =
  | 'home'
  | 'test'
  | 'spheres'
  | 'result'
  | 'roadmap'
  | 'universities'
  | 'profile'
  | 'admin';

export interface NavItem {
  id: NavItemId;
  label: string;
  emoji: string;
  path: string;
  adminOnly?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Главная', emoji: '🏠', path: '/home' },
  { id: 'test', label: 'Тест', emoji: '🧩', path: '/assessment/goal' },
  { id: 'spheres', label: 'Сферы профессий', emoji: '🧭', path: '/assessment/known-profession' },
  { id: 'result', label: 'Результат', emoji: '🎯', path: '/results' },
  { id: 'roadmap', label: 'План развития', emoji: '🗺️', path: '/results' },
  { id: 'universities', label: 'Университеты', emoji: '🎓', path: '/results' },
  { id: 'profile', label: 'Профиль', emoji: '👤', path: '/profile' },
  { id: 'admin', label: 'Админка', emoji: '⚙️', path: '/admin/users', adminOnly: true },
];

// A completed assessment must route back through /assessment/goal (where
// GoalSelectionPage shows the "already completed" screen), never straight
// into the live quiz view. assessmentId/goal are only cleared by an explicit
// restart, not by finishing — so their mere presence doesn't tell "in
// progress" and "completed" apart, hasCompletedAssessment must gate this too.
export function getTestPath(options: {
  assessmentId: string | null;
  goal: string | null;
  hasCompletedAssessment: boolean;
}): string {
  const { assessmentId, goal, hasCompletedAssessment } = options;
  return assessmentId && goal && !hasCompletedAssessment ? '/assessment' : '/assessment/goal';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? '?';
}

export function resolveNavPath(
  item: NavItem,
  options: {
    testPath: string;
    directionSlug?: string | null;
  },
): string {
  if (item.id === 'test') return options.testPath;
  if (item.id === 'roadmap' && options.directionSlug) {
    return `/results/directions/${encodeURIComponent(options.directionSlug)}/roadmap`;
  }
  if (item.id === 'universities' && options.directionSlug) {
    return `/results/directions/${encodeURIComponent(options.directionSlug)}/universities`;
  }
  return item.path;
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  switch (item.id) {
    case 'home':
      return pathname === '/home';
    case 'test':
      return pathname.startsWith('/assessment') && !pathname.startsWith('/assessment/known-profession');
    case 'spheres':
      return pathname.startsWith('/assessment/known-profession');
    case 'result':
      return pathname === '/results';
    case 'roadmap':
      return pathname.includes('/roadmap');
    case 'universities':
      return pathname.includes('/universities');
    case 'profile':
      return pathname === '/profile';
    case 'admin':
      return pathname.startsWith('/admin');
    default:
      return false;
  }
}
