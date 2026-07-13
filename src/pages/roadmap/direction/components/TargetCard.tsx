import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import type { RoadmapTarget } from '@/shared/types';

interface TargetCardProps {
  target: RoadmapTarget;
  directionName: string;
}

/** Russian plural for "год" — 1 год / 3 года / 5 лет. */
function yearsLabel(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
  return `${years} лет`;
}

export function TargetCard({ target, directionName }: TargetCardProps) {
  return (
    <Card elevated className="bg-brand-subtle flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl select-none" aria-hidden="true">🏁</span>
        <Badge variant="brand">{directionName}</Badge>
        <Badge variant="accent">Цель на {yearsLabel(target.horizon_years)}</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-caption font-semibold text-muted uppercase tracking-wide">
          Твоя конечная цель
        </p>
        <h2 className="text-h1 font-extrabold text-primary leading-tight">{target.role}</h2>
      </div>

      <p className="text-body text-primary leading-relaxed">{target.why}</p>
    </Card>
  );
}
