import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import type { ProfessionOption } from '@/shared/types';
import { roadmapDirectionCard, roadmapType } from '../roadmapTypography';

interface ProfessionsCardProps {
  professions: ProfessionOption[];
  directionName: string;
}

export function ProfessionsCard({ professions, directionName }: ProfessionsCardProps) {
  if (professions.length === 0) return null;
  const single = professions.length === 1 ? professions[0] : null;

  return (
    <div className={cn(roadmapDirectionCard, 'flex flex-col h-full')}>
      <div className={roadmapType.cardLabelBrand}>🏁 Направление</div>

      <h2 className={cn(roadmapType.cardTitle, 'my-1.5 mb-3.5')}>{directionName}</h2>

      {single ? (
        <>
          {single.why && (
            <p className={cn(roadmapType.growthBody, 'text-[#6B7280] mb-2.5 normal-case')}>
              {single.why}
            </p>
          )}
          <Badge variant="brand">{single.title}</Badge>
        </>
      ) : (
        <>
          <p className={cn(roadmapType.cardSubtitle, 'mb-2.5')}>
            Возможные роли в этом направлении
          </p>
          <div className="flex flex-wrap gap-2.5">
            {professions.map(profession => (
              <Badge key={profession.title} variant="brand">
                {profession.title}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
