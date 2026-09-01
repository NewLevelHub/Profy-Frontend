import { Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import type { PlanAboutYou } from '@/shared/types';

export function AboutYouSection({ aboutYou }: { aboutYou: PlanAboutYou }) {
  if (aboutYou.strengths.length === 0 && !aboutYou.growth) return null;

  return (
    <Card className="flex flex-col gap-3">
      {aboutYou.strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-brand" />
            <h3 className="text-body-sm font-semibold text-primary">Твои сильные стороны</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-body-sm text-secondary">
            {aboutYou.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {aboutYou.growth && (
        <div className="border-t border-default pt-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="text-body-sm font-semibold text-primary">Над чем поработать</h3>
          </div>
          <p className="text-body-sm text-primary font-medium">{aboutYou.growth.area}</p>
          <p className="text-body-sm text-secondary mt-1">{aboutYou.growth.why}</p>
        </div>
      )}
    </Card>
  );
}
