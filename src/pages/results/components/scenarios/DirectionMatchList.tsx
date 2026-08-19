import { memo } from 'react';
import { useNavigate } from 'react-router';
import { CareerMatchLadder } from '@/shared/ui/MatchLadder';
import type { StudentCareer } from '@/shared/types';

interface DirectionMatchListProps {
  careers: StudentCareer[];
  emptyText?: string;
}

/**
 * Shared "direction + match ladder" table — used by scenario B's
 * "НАПРАВЛЕНИЯ И ПРОФЕССИИ ПОД ЦЕЛЬ" and scenario C's step 01 "Направления
 * под цель". A single hairline-bordered list, not individually-bordered
 * cards — every row is a real `<button>` (native keyboard/focus support,
 * no synthetic click-div) that navigates to the direction detail page.
 * Always the complete list, including the top-ranked direction already
 * headlined above it — this table is meant to be the full reference, not
 * "everything except the one already shown." Deeper follow-through beyond
 * the detail page (comparison, filtering, "show more") is intentionally
 * out of scope here — this is the table itself, not the next step after it.
 */
export const DirectionMatchList = memo(function DirectionMatchList({
  careers,
  emptyText = 'Подходящих направлений пока нет.',
}: DirectionMatchListProps) {
  const navigate = useNavigate();

  if (careers.length === 0) {
    return <p className="text-caption text-muted">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-px bg-[var(--hairline)] border border-[var(--hairline)] rounded-[var(--radius)] overflow-hidden">
      {careers.map((career) => (
        <button
          key={career.slug}
          type="button"
          onClick={() => navigate(`/results/directions/${encodeURIComponent(career.slug)}`)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-surface hover:bg-hover transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <p className="text-body-md font-semibold text-[color:var(--midnight)] leading-snug truncate">
              {career.name}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <CareerMatchLadder tier={career.tier} showLabel={false} />
            <span aria-hidden="true" className="text-muted">→</span>
          </div>
        </button>
      ))}
    </div>
  );
});
