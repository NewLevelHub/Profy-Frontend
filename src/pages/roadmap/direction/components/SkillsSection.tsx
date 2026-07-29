import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { roadmapType } from '../roadmapTypography';

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (skills.length === 0) return null;

  return (
    <section>
      <h2 className={cn(roadmapType.sectionTitle, 'mb-3.5')}>
        🛠️ Навыки, которые построишь
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {skills.map((skill, i) => (
          <Badge key={i} variant="brand">
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );
}
