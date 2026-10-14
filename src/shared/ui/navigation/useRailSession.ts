import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks/useAuth';

/** What every area's navigation needs: who is signed in, where we are, sign-out. */
export function useRailSession() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return { user, activePath: location.pathname, onLogout };
}
