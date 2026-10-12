import { AdminNavigation } from '../redesign/AdminNavigation';
import { StudentNavigation } from '../redesign/StudentNavigation';
import { PsychologistNavigation } from '../redesign/PsychologistNavigation';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';
import { useProfileStore } from '@/shared/store/profile';
import { usePsychologistReviews } from '@/shared/hooks/usePsychologistReviews';
import type { AppArea } from '@/shared/ui/layouts/AppLayout';

// TopRail — the header for AppLayout. One component picks the navigation
// for the area: admin and psychologist workspaces get their side rails,
// everyone else the student header.
export function TopRail({ area }: { area: AppArea }) {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const profile = useProfileStore((s) => s.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: reviews } = usePsychologistReviews({ enabled: area === 'psychologist' });

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const identity = profile
    ? `${profile.name} · ${t('ageYears', { count: profile.age })}`
    : null;

  if (area === 'admin') return <AdminNavigation activePath={location.pathname} email={user?.email} onLogout={handleLogout} />;
  if (area === 'psychologist') return <PsychologistNavigation activePath={location.pathname} email={user?.email} reviewCount={reviews?.length ?? 0} onLogout={handleLogout} />;
  return <StudentNavigation activePath={location.pathname} identity={identity} onLogout={handleLogout} />;
}
