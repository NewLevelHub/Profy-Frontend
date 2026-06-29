import { PageStub } from '@/shared/ui/PageStub';

// Mobile ref: RoadmapScreen.tsx
// GET /roadmap/:assessmentId → RoadmapResponse
// Shows milestones by horizon: month_1 / months_3 / months_6 / year_1 / until_goal
// Each milestone has tasks with category (study/language/project/exam/explore/achievement)
export default function RoadmapPage() {
  return (
    <PageStub
      title="Роадмап"
      description="Персональный план развития по горизонтам: 1 мес / 3 мес / 6 мес / 1 год"
    />
  );
}
