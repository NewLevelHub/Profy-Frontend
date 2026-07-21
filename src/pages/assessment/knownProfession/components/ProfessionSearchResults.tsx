import { memo } from 'react';
import type { AgeGroup } from '@/shared/types';
import type { SpecialtySearchMatch } from '../utils/search';

interface ProfessionSearchResultsProps {
  results: SpecialtySearchMatch[];
  ageGroup: AgeGroup;
  onSelect: (match: SpecialtySearchMatch) => void;
}

export function ProfessionSearchResults({ results, ageGroup, onSelect }: ProfessionSearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-secondary text-center py-8">
        Ничего не нашлось. Попробуй другое слово или посмотри сферы целиком.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {results.map(match => (
        <ProfessionSearchResultItem
          key={`${match.sphereSlug}-${match.specialty.slug}`}
          match={match}
          ageGroup={ageGroup}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface ProfessionSearchResultItemProps {
  match: SpecialtySearchMatch;
  ageGroup: AgeGroup;
  onSelect: (match: SpecialtySearchMatch) => void;
}

const ProfessionSearchResultItem = memo(function ProfessionSearchResultItem({
  match,
  ageGroup,
  onSelect,
}: ProfessionSearchResultItemProps) {
  const label =
    ageGroup === 'junior' && match.specialty.label_junior
      ? match.specialty.label_junior
      : match.specialty.name;

  return (
    <button
      type="button"
      onClick={() => onSelect(match)}
      className="flex items-center gap-4 px-5 py-4 text-left border-[1.5px] border-default bg-surface hover:border-[#C4B5FD] hover:bg-hover hover:-translate-y-0.5 transition-all duration-[180ms]"
      style={{ borderRadius: 18, boxShadow: '0 4px 14px rgba(30,27,75,.04)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-primary" style={{ fontSize: 17 }}>
          {match.matchedProfession ?? label}
        </p>
        <p className="text-secondary text-xs font-semibold mt-0.5">
          {match.matchedProfession ? `${label} · ${match.sphereName}` : match.sphereName}
        </p>
      </div>
      <span className="text-[20px] text-[#A78BFA] font-black shrink-0" aria-hidden>
        ›
      </span>
    </button>
  );
});
