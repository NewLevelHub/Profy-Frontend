import { Outlet, useLocation } from 'react-router';
import { env } from '@/shared/config/env';

type AuthVariant = 'primary' | 'secondary';

const ROUTE_CONFIG: Record<string, { variant: AuthVariant }> = {
  '/login': { variant: 'primary' },
  '/register': { variant: 'primary' },
  '/verify-email': { variant: 'secondary' },
  '/forgot-password': { variant: 'secondary' },
  '/reset-password': { variant: 'secondary' },
};

const FALLBACK_CONFIG = { variant: 'primary' as AuthVariant };

export function AuthLayout() {
  const location = useLocation();
  const config = ROUTE_CONFIG[location.pathname] ?? FALLBACK_CONFIG;
  const isPrimary = config.variant === 'primary';

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-10">
      <div
        className="w-full"
        style={{
          maxWidth: isPrimary ? 488 : 480,
          background: 'var(--fog)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius)',
          padding: isPrimary ? '56px 34px 60px' : '44px 30px 40px',
          boxSizing: 'border-box',
        }}
      >
        {isPrimary && (
          <span className="font-display text-display-sm font-semibold text-[color:var(--midnight)]">
            {env.APP_NAME}
          </span>
        )}

        <Outlet />
      </div>
    </div>
  );
}
