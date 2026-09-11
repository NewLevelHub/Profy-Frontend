import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import type { RoadmapTarget } from '@/shared/types';

interface TargetCardProps {
  target: RoadmapTarget;
  directionName: string;
}

export function TargetCard({ target, directionName }: TargetCardProps) {
  const { t } = useTranslation('roadmap');
  return (
    <Card elevated className="bg-brand-subtle flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl select-none" aria-hidden="true">🏁</span>
        <Badge variant="brand">{directionName}</Badge>
        <Badge variant="accent">{t('target.goalForYears', { count: target.horizon_years })}</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-caption font-semibold text-muted uppercase tracking-wide">
          {t('target.finalGoalLabel')}
        </p>
        <h2 className="text-h1 font-extrabold text-primary leading-tight">{target.role}</h2>
      </div>

      <p className="text-body text-primary leading-relaxed">{target.why}</p>
    </Card>
  );
}
