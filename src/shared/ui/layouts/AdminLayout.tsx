import { NavLink, Outlet, useLocation } from 'react-router';
import { BookOpen, Building2, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Mono } from '@/shared/ui/typography/Mono';

/**
 * Admin chrome: one navigation surface for every `/admin/*` screen.
 *
 * Shell matches the journey ledger (Profile): `panel-glass` with a side rail
 * and a soft paper content column — same canvas language as Results /
 * Universities / Profile, not a separate flat dashboard.
 *
 * A single side rail keeps every destination visible at once, grouped, with
 * one active style. The content entities are a labelled group rather than a
 * hidden second level.
 */

interface AdminNavItem {
  to: string;
  label: string;
  icon?: typeof Users;
}

interface AdminNavGroup {
  label?: string;
  items: readonly AdminNavItem[];
}

const ADMIN_NAV: readonly AdminNavGroup[] = [
  {
    items: [
      { to: '/admin/users', label: 'Пользователи', icon: Users },
      { to: '/admin/universities', label: 'Университеты', icon: Building2 },
      { to: '/admin/feedback', label: 'Фидбэк', icon: MessageSquare },
    ],
  },
  {
    label: 'Контент диагностики',
    items: [
      { to: '/admin/content/questions', label: 'Вопросы', icon: BookOpen },
      { to: '/admin/content/question-pairs', label: 'Пары вопросов' },
      { to: '/admin/content/motivation-statements', label: 'Утверждения мотивации' },
      { to: '/admin/content/motivation-pairs', label: 'Пары мотивации' },
      { to: '/admin/content/directions', label: 'Направления' },
    ],
  },
];

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

export function AdminLayout() {
  const location = useLocation();

  return (
    <PageContainer>
      <div className="panel-glass overflow-hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav
          aria-label="Разделы админки"
          className="lg:border-r border-[color:color-mix(in_srgb,var(--border)_65%,transparent)] px-4 py-5 sm:px-5 lg:p-6 flex flex-col gap-4"
        >
          <div className="hidden lg:block">
            <span className="journey-kicker">Админка</span>
            <p className="font-display text-display-sm font-semibold text-[color:var(--text-heading)] mt-2 m-0 leading-tight">
              Управление
            </p>
          </div>

          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
            {ADMIN_NAV.map((group, groupIndex) => (
              <div key={group.label ?? groupIndex} className="flex lg:flex-col gap-1">
                {group.label && (
                  <Mono
                    variant="xs"
                    as="span"
                    className="hidden lg:block text-secondary px-3.5 pt-3 pb-1"
                  >
                    {group.label}
                  </Mono>
                )}
                {group.items.map((item) => (
                  <AdminNavLink key={item.to} item={item} pathname={location.pathname} />
                ))}
              </div>
            ))}
          </div>
        </nav>

        <div className="flex flex-col min-w-0 gap-5 p-4 sm:p-5 lg:p-7 pb-8 bg-[color-mix(in_srgb,var(--paper)_45%,transparent)]">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
}

function AdminNavLink({ item, pathname }: { item: AdminNavItem; pathname: string }) {
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
        'flex items-center gap-2 px-3.5 py-2.5 whitespace-nowrap transition-colors',
        'text-body-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_30%,transparent)]',
        active
          ? 'field-tile text-brand font-semibold'
          : 'rounded-[14px] text-secondary hover:text-primary hover:bg-hover',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {Icon && <Icon size={15} className="flex-shrink-0" />}
      {item.label}
    </NavLink>
  );
}
