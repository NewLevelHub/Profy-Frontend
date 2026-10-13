import { usePsychologistReviews } from '@/shared/hooks/usePsychologistReviews';
import { PsychologistNavigation } from '@/shared/ui/redesign/PsychologistNavigation';
import { useRailSession } from '@/shared/ui/navigation/useRailSession';
import { AppLayout } from './AppLayout';
import '../redesign/psychologist.css';
import '../redesign/psychologist-report.css';

function PsychologistRail() {
  const { user, activePath, onLogout } = useRailSession();
  const { data: reviews } = usePsychologistReviews();
  return (
    <PsychologistNavigation activePath={activePath} email={user?.email} reviewCount={reviews?.length ?? 0} onLogout={onLogout} />
  );
}

/**
 * The psychologist cabinet shell as a lazy route: its navigation, the review
 * queue counter and its stylesheets load with it, before the first render,
 * instead of shipping to every student and guest inside the entry chunk.
 */
export default function PsychologistArea() {
  return <AppLayout area="psychologist" rail={<PsychologistRail />} />;
}
