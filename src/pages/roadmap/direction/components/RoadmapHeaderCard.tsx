import { useTranslation } from 'react-i18next';
import { Mascot } from '@/shared/ui/Mascot';
import { Heading } from '@/shared/ui/typography/Heading';

interface RoadmapHeaderCardProps {
  directionName: string;
  /** Calendar year the plan is aimed at — derived from `target.horizon_years`, not invented. */
  targetYear: number;
}

/**
 * Page header per spec 07: Fog-bordered card, 34/30/40 padding — left a
 * display headline, right a mono "ЦЕЛЬ" meta line + transition-state mascot.
 * `transition` (not `completion`) because arriving on the plan is a stage
 * change, not a finished task — same reasoning as GoalCheckPage's mascot.
 */
export function RoadmapHeaderCard({ directionName, targetYear }: RoadmapHeaderCardProps) {
  const { t } = useTranslation('roadmap');
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-[34px] pr-[30px] pb-[40px] pl-[30px]"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <Heading level="display-md" className="text-[color:var(--text-heading)]">
        {t('header.pathTo', { name: directionName })}
      </Heading>

      <div className="flex items-center gap-4 shrink-0">
        <span
          className="font-mono text-mono-xs font-bold uppercase tracking-label text-muted whitespace-nowrap"
        >
          {t('header.goalAdmissionYear', { year: targetYear })}
        </span>
        <Mascot state="transition" size={56} />
      </div>
    </div>
  );
}
