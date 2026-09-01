import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/shared/api/profile';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import type { CertificateItem, CertificateType } from '@/shared/types';
import { CERTIFICATE_TYPES, validateCertificateScore } from '@/shared/config/certificates';

type Scores = Record<CertificateType, string>;
type FieldErrors = Partial<Record<CertificateType, string>>;

function scoreOf(items: CertificateItem[], type: CertificateType): string {
  const found = items.find(i => i.type === type);
  return found ? String(found.score) : '';
}

export function useCertificatesEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);

  const [scores, setScores] = useState<Scores>(() =>
    Object.fromEntries(CERTIFICATE_TYPES.map(t => [t, ''])) as Scores,
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  // Reached client-side from Profile (ArtifactsSection's sibling), the store
  // is already populated by the time this mounts — same reliance as
  // useArtifactsSetup's edit-mode path. But this route also sits directly
  // under RequireProfile (no AppLayout in between, see router.tsx), which is
  // reachable via a hard reload/direct URL: RequireProfile renders <Outlet/>
  // the instant its query resolves, one render before its own effect copies
  // that result into the store — a lazy useState initializer reading
  // `profile` at that exact mount would silently capture `null` and never
  // update, showing a blank form over real saved data. Syncing via effect
  // instead re-runs once the store catches up.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    if (!profile || hasHydrated) return;
    setScores(Object.fromEntries(CERTIFICATE_TYPES.map(t => [t, scoreOf(profile.certificates, t)])) as Scores);
    setHasHydrated(true);
  }, [profile, hasHydrated]);

  function setScore(type: CertificateType, value: string) {
    setScores(prev => ({ ...prev, [type]: value }));
    setErrors(prev => ({ ...prev, [type]: undefined }));
  }

  // Single PUT /profile carries the certificates inline (same combined-write
  // contract artifacts already uses) — one request, one transaction.
  const saveMutation = useMutation({
    mutationFn: (payload: { certificates: CertificateItem[] }) => profileApi.update(payload),
    onSuccess: (updated) => {
      setProfile(updated);
      if (userId) queryClient.setQueryData(['profile', userId], updated);
      navigate('/profile', { replace: true });
    },
  });

  // Every row is optional here (this screen is opened to fill scores in, not
  // to complete a required step), so a blank field is never an error — only
  // an out-of-range one is. Onboarding's block reuses the same validator with
  // `required: true` for exams the student explicitly ticked.
  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    for (const type of CERTIFICATE_TYPES) {
      nextErrors[type] = validateCertificateScore(type, scores[type]);
    }
    setErrors(nextErrors);
    return Object.values(nextErrors).every(e => e === undefined);
  }

  function handleSave() {
    if (!validate()) return;

    const certificates: CertificateItem[] = CERTIFICATE_TYPES
      .filter(type => scores[type].trim() !== '')
      .map(type => ({ type, score: Number(scores[type]) }));

    saveMutation.mutate({ certificates });
  }

  return {
    scores,
    setScore,
    errors,
    isLoading: saveMutation.isPending,
    saveError: saveMutation.isError,
    handleSave,
    handleCancel: () => navigate('/profile'),
  };
}
