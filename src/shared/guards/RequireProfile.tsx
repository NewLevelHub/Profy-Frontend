import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '@/app/routes';
import { profileApi } from '@/shared/api/profile';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import { Spinner } from '@/shared/ui';
import type { AxiosError } from 'axios';

export function RequireProfile() {
  const userId = useAuthStore(s => s.user?.id);
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);
  const clearProfile = useProfileStore(s => s.clearProfile);

  const profileMatchesUser = Boolean(profile && userId && profile.user_id === userId);

  useEffect(() => {
    if (profile && userId && profile.user_id !== userId) {
      clearProfile();
    }
  }, [profile, userId, clearProfile]);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () =>
      profileApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    enabled: Boolean(userId),
    retry: false,
  });

  useEffect(() => {
    if (!userId) return;
    if (data) setProfile(data);
    if (data === null) clearProfile();
  }, [data, userId, setProfile, clearProfile]);

  if (profileMatchesUser || data) return <Outlet />;

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data === null) return <Navigate to={ROUTES.welcome} replace />;

  return <Outlet />;
}
