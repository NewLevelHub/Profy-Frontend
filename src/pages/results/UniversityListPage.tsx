import { PageStub } from '@/shared/ui/PageStub';

// Mobile ref: UniversityListScreen.tsx
// GET /universities/programs?direction=:slug → ProgramBrief[]
// Each item → ProgramDetailPage
export default function UniversityListPage() {
  return (
    <PageStub
      title="Университеты"
      description="Список программ по направлению: название, язык, стоимость, университет"
    />
  );
}
