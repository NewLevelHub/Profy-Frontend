import { PageStub } from '@/shared/ui/PageStub';

// Mobile ref: GapAnalysisScreen.tsx
// GET /universities/programs/:id/gap-analysis?assessment_id=:id → GapAnalysisResponse
// Shows: readiness_score, met / not_met / in_progress / unknown items
export default function GapAnalysisPage() {
  return (
    <PageStub
      title="Анализ готовности"
      description="Gap-анализ между профилем пользователя и требованиями программы"
    />
  );
}
