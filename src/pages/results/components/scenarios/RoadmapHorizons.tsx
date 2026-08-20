import { Spine, type SpineNode } from '@/shared/ui/Spine';
import { Card } from '@/shared/ui/Card';

export interface HorizonItem {
  id: string;
  label: string;
  title: string;
  description: string;
}

interface RoadmapHorizonsProps {
  title: string;
  horizons: HorizonItem[];
  ariaLabel: string;
  /**
   * `'open'` (scenario A / explore) leaves the last node dashed/unfilled —
   * exploration has no fixed finish line. `'filled'` (scenario B/C) renders
   * a solid pine "цель" node, since those scenarios do have a target.
   */
  lastNodeStyle: 'filled' | 'open';
}

/**
 * Horizon strip shared by all three goal scenarios on /results. Content is
 * static, hand-authored per scenario type (see ScenarioA/B/C) rather than
 * pulled from the per-direction 12-month roadmap API — that roadmap is a
 * separate, deeper feature (`/results/directions/:slug/roadmap`) generated
 * per-student server-side; nothing in the result-v2 payload itself supplies
 * short "roadmap of the next N months toward a goal" copy for this summary
 * strip, so this is a structural placeholder, not personalized backend data.
 */
export function RoadmapHorizons({ title, horizons, ariaLabel, lastNodeStyle }: RoadmapHorizonsProps) {
  const nodes: SpineNode[] = horizons.map((h, i) => ({
    id: h.id,
    status: i === 0 ? 'current' : 'upcoming',
    goal: i === horizons.length - 1,
    goalStyle: i === horizons.length - 1 ? lastNodeStyle : undefined,
    segment: i === horizons.length - 1 && lastNodeStyle === 'open' ? 'dashed' : undefined,
    label: h.label,
  }));

  return (
    <div>
      <h3 className="text-label font-bold text-primary mb-4 font-mono uppercase tracking-label">{title}</h3>
      <Spine nodes={nodes} showLabels className="mb-8" ariaLabel={ariaLabel} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {horizons.map((h) => (
          <Card key={h.id} className="!p-4 flex flex-col gap-1">
            <p className="text-tiny font-mono font-bold uppercase tracking-label text-muted">{h.label}</p>
            <p className="font-extrabold text-primary text-body-sm">{h.title}</p>
            <p className="text-caption text-secondary leading-snug">{h.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
