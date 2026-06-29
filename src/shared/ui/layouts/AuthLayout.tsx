import { Outlet } from 'react-router';
import { env } from '@/shared/config/env';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-page text-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-block text-2xl font-black tracking-tight text-primary">
            {env.APP_NAME}
          </span>
          <p className="text-secondary text-sm mt-1">Платформа карьерной ориентации</p>
        </div>
        <div className="rounded-2xl border border-default bg-surface p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
