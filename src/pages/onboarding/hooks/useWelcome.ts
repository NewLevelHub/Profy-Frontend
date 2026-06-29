import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useProfileStore } from '@/shared/store/profile';
import { useAuthStore } from '@/shared/store/auth';
import type { AxiosError } from 'axios';

export function useWelcome() {
  const navigate = useNavigate();
  const setProfile = useProfileStore(s => s.setProfile);
  const user = useAuthStore(s => s.user);
  const firstName = user?.name?.trim().split(' ')[0] ?? null;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      profileApi.get().catch((err: AxiosError) => {
        if (err.response?.status === 404) return null;
        throw err;
      }),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (profile) {
      setProfile(profile);
      navigate('/home', { replace: true });
    }
  }, [profile, navigate, setProfile]);

  return { isLoading, firstName };
}
