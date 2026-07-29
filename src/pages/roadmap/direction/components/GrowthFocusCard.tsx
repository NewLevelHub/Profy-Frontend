import { cn } from '@/shared/lib/cn';
import type { GrowthFocus } from '@/shared/types';
import { roadmapGrowthCard, roadmapType } from '../roadmapTypography';

interface GrowthFocusCardProps {
  growthFocus: GrowthFocus;
}

export function GrowthFocusCard({ growthFocus }: GrowthFocusCardProps) {
  return (
    <div className={cn(roadmapGrowthCard, 'flex flex-col h-full')}>
      <div className={roadmapType.cardLabelAccent}>🌱 Твоя точка роста</div>
      <p className={cn(roadmapType.growthTitle, 'my-1.5 mb-2')}>{growthFocus.weakness}</p>
      <p className={roadmapType.growthBody}>{growthFocus.why_it_matters}</p>
    </div>
  );
}
