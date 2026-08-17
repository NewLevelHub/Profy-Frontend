import React from 'react';
import { cn } from '@/shared/lib/cn';
import { playClick } from '@/shared/lib/sounds';
import type { MotivationStatement } from '@/shared/types';

interface TripletChoiceProps {
  statements: MotivationStatement[];
  mostId: string | null;
  leastId: string | null;
  onSelectMost: (statementId: string) => void;
  onSelectLeast: (statementId: string) => void;
}

export const TripletChoice = React.memo(function TripletChoice({
  statements,
  mostId,
  leastId,
  onSelectMost,
  onSelectLeast,
}: TripletChoiceProps) {
  function handleCardClick(statementId: string) {
    playClick('soft');
    if (mostId === statementId) {
      onSelectMost(statementId); // toggles off
      return;
    }
    if (leastId === statementId) {
      onSelectLeast(statementId); // toggles off
      return;
    }
    if (mostId === null) {
      onSelectMost(statementId);
      return;
    }
    if (leastId === null) {
      onSelectLeast(statementId);
    }
    // both roles already taken by other cards — tap the assigned card to free a role first
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {statements.map(statement => {
        const isMost = mostId === statement.id;
        const isLeast = leastId === statement.id;
        return (
          <button
            key={statement.id}
            type="button"
            onClick={() => handleCardClick(statement.id)}
            className={cn(
              'w-full flex flex-col gap-2 text-left border-2 px-5 py-[18px] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-brand',
              isMost
                ? 'border-brand bg-active-tint'
                : isLeast
                  ? 'border-default bg-danger-subtle'
                  : 'border-default bg-surface text-primary hover:border-brand',
            )}
            style={{ borderRadius: 18 }}
          >
            <span className="font-bold text-primary leading-snug" style={{ fontSize: 16 }}>
              {statement.text}
            </span>
            {(isMost || isLeast) && (
              <span
                className={cn(
                  'self-start font-extrabold rounded-pill px-3 py-1',
                  isMost ? 'text-brand bg-brand-subtle' : 'text-danger',
                )}
                style={{ fontSize: 12 }}
              >
                {isMost ? 'Важнее всего' : 'Менее всего'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
