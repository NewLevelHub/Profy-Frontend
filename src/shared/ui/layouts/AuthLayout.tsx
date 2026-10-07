import { Outlet, useLocation } from 'react-router';
import { AuthShell } from '@/shared/ui/redesign/AuthShell';

const AUTH_PAGES = {
  '/login': 'login',
  '/register': 'register',
  '/verify-email': 'verifyEmail',
  '/forgot-password': 'forgotPassword',
  '/reset-password': 'resetPassword',
} as const;

export function AuthLayout() {
  const { pathname } = useLocation();
  const page = AUTH_PAGES[pathname as keyof typeof AUTH_PAGES] ?? 'login';
  return <AuthShell page={page}><Outlet /></AuthShell>;
}
