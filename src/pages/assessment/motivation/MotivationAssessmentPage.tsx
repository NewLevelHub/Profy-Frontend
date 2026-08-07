import { useProfileStore } from '@/shared/store/profile';
import MotivationTripletFlow from './MotivationTripletFlow';
import MotivationHarterFlow from './MotivationHarterFlow';

// Senior uses the 3-way MOST/LEAST triplets (MotivationTripletFlow.tsx).
// Junior/middle use Harter's Structured Alternative Format instead
// (MotivationHarterFlow.tsx) — both live under the same /assessment/motivation
// route, this component just picks which one to render.
export default function MotivationAssessmentPage() {
  const ageGroup = useProfileStore(s => s.profile?.age_group);
  if (ageGroup === 'senior') return <MotivationTripletFlow />;
  return <MotivationHarterFlow />;
}
