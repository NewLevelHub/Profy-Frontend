import { cn } from '@/shared/lib/cn';
import { roadmapCtaButton, roadmapType } from '../roadmapTypography';

interface RoadmapUniversitiesCtaProps {
  directionSlug: string;
  onNavigate: (path: string) => void;
}

export function RoadmapUniversitiesCta({ directionSlug, onNavigate }: RoadmapUniversitiesCtaProps) {
  return (
    <button
      type="button"
      className={cn(roadmapCtaButton, roadmapType.cta)}
      onClick={() =>
        onNavigate(`/results/directions/${encodeURIComponent(directionSlug)}/universities`)
      }
    >
      🎓 Куда поступать — смотреть вузы
    </button>
  );
}
