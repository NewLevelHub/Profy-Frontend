import { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/shared/api/auth';
import { useAuthStore } from '@/shared/store/auth';
import { FullPageSpinner } from '@/shared/ui/Spinner';
import { usePsychologistReviews } from '@/shared/hooks/usePsychologistReviews';
import { PsychologistNavigation } from '@/shared/ui/redesign/PsychologistNavigation';
import { useRailSession } from '@/shared/ui/navigation/useRailSession';
import { AppLayout } from './AppLayout';
import '../redesign/psychologist.css';
import '../redesign/psychologist-report.css';

function PsychologistRail() {
  const { user, activePath, onLogout } = useRailSession();
  const isOwner = user?.role === 'owner';
  // The review queue is psychologist-only on the API; the owner has none.
  const { data: reviews } = usePsychologistReviews({ enabled: !isOwner });
  return (
    <PsychologistNavigation
      activePath={activePath}
      email={user?.email}
      name={user?.full_name ?? null}
      reviewCount={reviews?.length ?? 0}
      isOwner={isOwner}
      onLogout={onLogout}
    />
  );
}

/**
 * The psychologist cabinet shell as a lazy route: its navigation, the review
 * queue counter and its stylesheets load with it, before the first render,
 * instead of shipping to every student and guest inside the entry chunk.
 */
export default function PsychologistArea() {
  // An invitation may come without a name; the cabinet waits for one —
  // the owner, the CRM and students show the specialist by it.
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // A user persisted before `full_name` existed has no such key: ask the
  // server rather than send a named specialist to the name step.
  const known = user?.full_name !== undefined;
  const me = useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.me, enabled: !known, retry: false });
  useEffect(() => {
    if (!known && me.data) setUser(me.data);
  }, [known, me.data, setUser]);

  if (!known && me.isPending) return <FullPageSpinner />;
  const current = known ? user : me.data;
  if (current && !current.full_name?.trim()) return <Navigate to="/staff/name" replace />;
  return <AppLayout area="psychologist" rail={<PsychologistRail />} />;
}
