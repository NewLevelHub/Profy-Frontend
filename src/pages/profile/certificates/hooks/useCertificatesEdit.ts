import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { profileApi } from '@/shared/api/profile';
import { useAuthStore } from '@/shared/store/auth';
import { useProfileStore } from '@/shared/store/profile';
import type { CertificateItem, CertificateType, GpaScale } from '@/shared/types';
import { CERTIFICATE_TYPES, CERTIFICATE_SCORE_RANGES, GPA_SCALE_MAX } from '../utils/certificateConfig';

type Scores = Record<CertificateType, string>;
type FieldErrors = Partial<Record<CertificateType | 'gpa', string>>;

function scoreOf(items: CertificateItem[], type: CertificateType): string {
  const found = items.find(i => i.type === type);
  return found ? String(found.score) : '';
}

export function useCertificatesEdit() {
  const navigate = useNavigate();
  const { t } = useTranslation('profile');
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);
  const profile = useProfileStore(s => s.profile);
  const setProfile = useProfileStore(s => s.setProfile);

  const [scores, setScores] = useState<Scores>(() =>
    Object.fromEntries(CERTIFICATE_TYPES.map(t => [t, ''])) as Scores,
  );
  const [gpaScale, setGpaScaleState] = useState<GpaScale | null>(null);
  const [gpaValue, setGpaValueState] = useState('');
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
    setGpaScaleState(profile.gpa_scale ?? null);
    setGpaValueState(profile.gpa_value != null ? String(profile.gpa_value) : '');
    setHasHydrated(true);
  }, [profile, hasHydrated]);

  function setScore(type: CertificateType, value: string) {
    setScores(prev => ({ ...prev, [type]: value }));
    setErrors(prev => ({ ...prev, [type]: undefined }));
  }

  function setGpaScale(scale: GpaScale) {
    setGpaScaleState(scale);
    setErrors(prev => ({ ...prev, gpa: undefined }));
  }

  function setGpaValue(value: string) {
    setGpaValueState(value);
    setErrors(prev => ({ ...prev, gpa: undefined }));
  }

  // Single PUT /profile carries certificates + GPA together (both accepted
  // inline, same combined-write contract artifacts already uses) — one
  // request, one transaction, instead of a separate call per section.
  const saveMutation = useMutation({
    mutationFn: (payload: { certificates: CertificateItem[]; gpa_value: number | null; gpa_scale: GpaScale | null }) =>
      profileApi.update(payload),
    onSuccess: (updated) => {
      setProfile(updated);
      if (userId) queryClient.setQueryData(['profile', userId], updated);
      navigate('/profile', { replace: true });
    },
  });

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    for (const type of CERTIFICATE_TYPES) {
      const raw = scores[type].trim();
      if (!raw) continue;
      const n = Number(raw);
      const { min, max } = CERTIFICATE_SCORE_RANGES[type];
      if (Number.isNaN(n) || n < min || n > max) {
        nextErrors[type] = t('edit.errorRange', { min, max });
      }
    }

    const gpaRaw = gpaValue.trim();
    if (gpaRaw || gpaScale) {
      if (!gpaScale) {
        nextErrors.gpa = t('edit.errorChooseScale');
      } else if (!gpaRaw) {
        nextErrors.gpa = t('edit.errorEnterScore');
      } else {
        const n = Number(gpaRaw);
        const max = GPA_SCALE_MAX[gpaScale];
        if (Number.isNaN(n) || n < 0 || n > max) {
          nextErrors.gpa = t('edit.errorGpaRange', { max });
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const certificates: CertificateItem[] = CERTIFICATE_TYPES
      .filter(type => scores[type].trim() !== '')
      .map(type => ({ type, score: Number(scores[type]) }));

    const gpaRaw = gpaValue.trim();
    // `null`/`null` here means "leave GPA untouched" on the backend (it
    // can't be cleared once set via this endpoint — same limitation every
    // other scalar profile field already has). If the student blanks the
    // GPA fields and saves, the response below will restore whatever was
    // last persisted, which is the honest outcome, not a silent no-op.
    saveMutation.mutate({
      certificates,
      gpa_value: gpaRaw && gpaScale ? Number(gpaRaw) : null,
      gpa_scale: gpaRaw && gpaScale ? gpaScale : null,
    });
  }

  return {
    scores,
    setScore,
    gpaScale,
    setGpaScale,
    gpaValue,
    setGpaValue,
    errors,
    isLoading: saveMutation.isPending,
    saveError: saveMutation.isError,
    handleSave,
    handleCancel: () => navigate('/profile'),
  };
}
