import { Outlet, useLocation } from 'react-router';
import { AuthShell } from '@/shared/ui/redesign/AuthShell';

export function AuthLayout() {
  const { pathname } = useLocation();
  const mode = pathname === '/register' || pathname === '/verify-email'
    ? 'register'
    : pathname === '/forgot-password' || pathname === '/reset-password'
      ? 'recovery'
      : 'login';
  return <AuthShell mode={mode}><Outlet /></AuthShell>;
}
