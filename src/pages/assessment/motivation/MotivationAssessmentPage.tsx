import { useEnsureProfile } from '@/shared/hooks/useEnsureProfile';
import { Spinner } from '@/shared/ui';
import MotivationTripletFlow from './MotivationTripletFlow';
import MotivationHarterFlow from './MotivationHarterFlow';

// Senior uses the 3-way MOST/LEAST triplets (MotivationTripletFlow.tsx).
// Junior/middle use Harter's Structured Alternative Format instead
// (MotivationHarterFlow.tsx) — both live under the same /assessment/motivation
// route, this component just picks which one to render.
//
// Возраст берётся через useEnsureProfile, а не прямо из стора: экран лежит
// вне RequireProfile, поэтому после F5 и по прямой ссылке стор пуст. Раньше
// это молча означало «не senior», и старшекласснику, обновившему страницу
// посреди блока мотивации, доставался младший инструмент — он отвечал не на
// тот опросник, а в отчёт шли ответы не того формата. Пока возраст неизвестен,
// не выбираем ничего.
export default function MotivationAssessmentPage() {
  const { profile, isLoading } = useEnsureProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-page">
        <Spinner size="lg" />
      </div>
    );
  }

  if (profile?.age_group === 'senior') return <MotivationTripletFlow />;
  return <MotivationHarterFlow />;
}
