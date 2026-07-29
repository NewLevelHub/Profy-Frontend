import { memo } from 'react';
import { Mascot, type MascotKind } from '@/shared/ui';
import type { AgeGroup, DirectionTreeNode } from '@/shared/types';
import { getSphereTags, formatProfessionCount } from '../utils/sphereTags';

interface SphereCardProps {
  sphere: DirectionTreeNode;
  mascotKind: MascotKind;
  ageGroup: AgeGroup;
  onClick: () => void;
}

export const SphereCard = memo(function SphereCard({
  sphere,
  mascotKind,
  ageGroup,
  onClick,
}: SphereCardProps) {
  const tags = getSphereTags(sphere, ageGroup);

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-surface border-[1.5px] border-default rounded-[22px] overflow-hidden flex flex-col transition-all duration-[180ms] hover:border-brand hover:bg-hover hover:-translate-y-0.5"
      style={{ boxShadow: '0 4px 14px rgba(30,27,75,.05)' }}
    >
      <div className="h-[150px] sm:h-[180px] w-full bg-brand-subtle flex items-end justify-center shrink-0">
        <Mascot kind={mascotKind} className="w-[110px] h-[140px] sm:w-[150px] sm:h-[180px]" />
      </div>
      <div className="px-5 py-[18px] flex flex-col gap-[10px]">
        <div className="flex items-center gap-[9px]">
          <span className="w-3 h-3 rounded-full flex-none bg-brand" aria-hidden="true" />
          <span className="font-extrabold text-primary text-[17px] sm:text-[18px] tracking-[-0.01em] text-pretty">
            {sphere.name}
          </span>
        </div>
        <div className="text-secondary font-semibold text-sm">
          {formatProfessionCount(sphere.professions.length)}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-[7px]">
            {tags.map(tag => (
              <span
                key={tag}
                title={tag}
                className="text-xs font-bold px-[10px] py-[5px] rounded-pill bg-brand-subtle text-brand whitespace-nowrap truncate min-w-0 max-w-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
});
