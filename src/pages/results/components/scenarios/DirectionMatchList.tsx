import { memo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/shared/ui/Card';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
import { getIconForCareer } from '../../utils/careerIcon';
import type { StudentCareer } from '@/shared/types';

interface DirectionMatchListProps {
  careers: StudentCareer[];
  /** Slugs to leave out (e.g. the direction already shown as the goal-card above). */
  excludeSlugs?: string[];
  emptyText?: string;
}

/**
 * Shared "direction + match ladder" list — used by scenario B's "НАПРАВЛЕНИЯ
 * И ПРОФЕССИИ ПОД ЦЕЛЬ" and scenario C's step 01 "Направления под цель".
 * Deliberately the same row pattern in both places per spec.
 */
export const DirectionMatchList = memo(function DirectionMatchList({
  careers,
  excludeSlugs = [],
  emptyText = 'Подходящих направлений пока нет.',
}: DirectionMatchListProps) {
  const navigate = useNavigate();
  const excluded = new Set(excludeSlugs);
  const items = careers.filter((c) => !excluded.has(c.slug));

  if (items.length === 0) {
    return <p className="text-caption text-muted">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((career) => (
        <li key={career.slug}>
          <Card
            onClick={() => navigate(`/results/directions/${encodeURIComponent(career.slug)}`)}
            className="!p-4 flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-pop"
          >
            <span className="text-xl select-none flex-shrink-0" aria-hidden="true">
              {getIconForCareer(career.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-primary truncate" style={{ fontSize: 14.5 }}>{career.name}</p>
              <p className="text-caption text-muted truncate">{career.why}</p>
            </div>
            <CareerMatchLadder tier={career.tier} showLabel={false} />
          </Card>
        </li>
      ))}
    </ul>
  );
});
