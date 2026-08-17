import { memo } from 'react';
import { Card } from '@/shared/ui/Card';

interface RoadmapFocusCardProps {
  focusSummary: string | null;
}

export const RoadmapFocusCard = memo(function RoadmapFocusCard({ focusSummary }: RoadmapFocusCardProps) {
  if (!focusSummary) return null;

  return (
    <Card elevated className="bg-brand-subtle flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl select-none" aria-hidden="true">💡</span>
        <span className="text-caption font-semibold text-muted uppercase tracking-wide">
          Фокус твоего развития
        </span>
      </div>
      <p className="text-body text-primary leading-relaxed font-semibold">{focusSummary}</p>
    </Card>
  );
});
