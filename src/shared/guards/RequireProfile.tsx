import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import { Spinner } from '@/shared/ui';
import type { AxiosError } from 'axios';

export function RequireProfile() {
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      profileApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (data) setProfile(data);
  }, [data, setProfile]);

  // Profile already in store (set during this session, e.g. after onboarding)
  if (profile) return <Outlet />;

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return <Navigate to="/welcome" replace />;

  return <Outlet />;
}
