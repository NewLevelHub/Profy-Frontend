import { NavLink, Outlet, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Building2, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PageContainer } from '@/shared/ui/PageContainer';
import { MONO_LABEL } from '@/shared/ui/admin/density';

/**
 * Admin chrome: one navigation surface for every `/admin/*` screen.
 *
 * Before PRO-242 this was a row of four tabs, under which the content section
 * added a second row of five more — three levels of navigation counting the
 * product's own top rail, in two different active-state styles (an underline
 * on one row, a filled pill on the other). The five content entities were only
 * discoverable after clicking into "Вопросы".
 *
 * A single side rail flattens that: every destination in the admin panel is
 * visible at once, grouped, with one active style. The content entities become
 * a labelled group rather than a hidden second level.
 *
 * The role badge that used to sit here is gone. It derived "Администратор" vs
 * "Оператор" from the one boolean the backend has (`is_admin`), which
 * `RequireAdmin` already gates on — so every person who could see the badge was
 * an administrator by construction, and the operator state was unreachable.
 * See docs/admin-backend-requests-pro-242.md §9.
 */

interface AdminNavItem {
  to: string;
  /** Catalog key under `admin:nav.*` — resolved at render, not here: this is a
      module-level constant and cannot call `t` (same shape as KZ-202's
      constants.ts). */
  labelKey: string;
  icon?: typeof Users;
}

interface AdminNavGroup {
  labelKey?: string;
  items: readonly AdminNavItem[];
}

const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    items: [
      { to: '/admin/users', labelKey: 'nav.users', icon: Users },
      { to: '/admin/universities', labelKey: 'nav.universities', icon: Building2 },
      { to: '/admin/feedback', labelKey: 'nav.feedback', icon: MessageSquare },
    ],
  },
  {
    labelKey: 'nav.contentGroup',
    items: [
      { to: '/admin/content/questions', labelKey: 'nav.questions', icon: BookOpen },
      { to: '/admin/content/question-pairs', labelKey: 'nav.questionPairs' },
      { to: '/admin/content/motivation-statements', labelKey: 'nav.motivationStatements' },
      { to: '/admin/content/motivation-pairs', labelKey: 'nav.motivationPairs' },
      { to: '/admin/content/directions', labelKey: 'nav.directions' },
    ],
  },
];

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

export function AdminLayout() {
  const { t } = useTranslation('admin');
  const location = useLocation();

  return (
    <PageContainer className="flex flex-col lg:flex-row gap-5 lg:gap-8">
      {/* lg+: side rail. Below lg: one horizontally scrollable row, so the nav
          costs one line instead of wrapping into three stacked rows. */}
      <nav aria-label={t('nav.aria')} className="lg:w-[200px] lg:flex-shrink-0">
        {/* `AppLayout`'s <main> is the scroll container, so the rail sticks to
            the top of that scrollport, not to the viewport. */}
        <div className="lg:sticky lg:top-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0">
          {ADMIN_NAV.map((group, groupIndex) => (
            <div key={group.labelKey ?? groupIndex} className="flex lg:flex-col gap-1 lg:gap-0.5">
              {group.labelKey && (
                <span
                  className={cn(
                    MONO_LABEL,
                    'hidden lg:block text-muted px-2.5 pt-4 pb-1.5',
                  )}
                >
                  {t(group.labelKey)}
                </span>
              )}
              {group.items.map((item) => (
                <AdminNavLink key={item.to} item={item} pathname={location.pathname} />
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0 flex flex-col gap-5 pb-8">
        <Outlet />
      </div>
    </PageContainer>
  );
}

function AdminNavLink({ item, pathname }: { item: AdminNavItem; pathname: string }) {
  const { t } = useTranslation('admin');
  const Icon = item.icon;
  // Prefix matching, but the longest matching route wins — otherwise
  // `/admin/content/questions` would also light up `/admin/content/question-pairs`
  // is not a prefix of it, yet a naive `startsWith` on a shorter sibling route
  // can mark two items active at once.
  const active =
    ALL_ITEMS.filter((candidate) => pathname.startsWith(candidate.to)).sort(
      (a, b) => b.to.length - a.to.length,
    )[0]?.to === item.to;

  return (
    <NavLink
      to={item.to}
      className={cn(
        'flex items-center gap-2 px-2.5 py-2 rounded-[3px] transition-colors whitespace-nowrap',
        'font-sans text-caption font-medium',
        'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        active
          ? 'bg-brand-subtle text-brand font-semibold'
          : 'text-muted hover:text-primary hover:bg-hover',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {Icon && <Icon size={14} className="flex-shrink-0" />}
      {t(item.labelKey)}
    </NavLink>
  );
}
