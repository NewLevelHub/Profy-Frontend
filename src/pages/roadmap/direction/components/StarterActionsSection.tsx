import { cn } from '@/shared/lib/cn';
import { roadmapActionNumber, roadmapActionRow, roadmapSurfaceCard, roadmapType } from '../roadmapTypography';

interface StarterActionsSectionProps {
  actions: string[];
}

export function StarterActionsSection({ actions }: StarterActionsSectionProps) {
  if (actions.length === 0) return null;

  return (
    <section className={roadmapSurfaceCard}>
      <h2 className={cn(roadmapType.sectionTitle, 'mb-[18px]')}>
        🚀 Что можно начать уже сейчас
      </h2>
      <ul className="flex flex-col gap-3.5">
        {actions.map((action, i) => (
          <li key={i} className={roadmapActionRow}>
            <span className={roadmapActionNumber}>{i + 1}</span>
            <p className={cn(roadmapType.actionText, 'flex-1 m-0')}>{action}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
