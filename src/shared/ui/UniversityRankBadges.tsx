import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import { getUniversityRankingLabels } from '@/shared/lib/universityDisplay';
import type { UniversityBrief } from '@/shared/types';

interface UniversityRankBadgesProps {
  university: Pick<UniversityBrief, 'country' | 'ranking' | 'uniranks_kz_rank' | 'uniranks_world_rank'>;
  size?: 'sm' | 'md';
}

/**
 * The university's single ranking chip, in the one unified format
 * getUniversityRankingLabels produces (KZ → in-country position, foreign →
 * world position, always "система · #N …") — shared between the card grid and
 * the detail page so the rendering (and the font-weight-per-script caveat
 * below) lives in one place instead of two copies drifting apart. Still maps
 * over the returned array (0 or 1 entries) so an empty result renders
 * nothing.
 */
export function UniversityRankBadges({ university, size = 'md' }: UniversityRankBadgesProps) {
  const { t } = useTranslation('results');
  const labels = getUniversityRankingLabels(university, t);
  if (labels.length === 0) return null;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2.5 py-0.5'
    : 'text-sm px-3.5 py-1.5';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((rankText, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-pill max-w-full ${sizeClasses}`}
          style={{
            color: 'var(--lake)',
            background: 'color-mix(in srgb, var(--lake) 12%, var(--paper))',
            border: '1px solid color-mix(in srgb, var(--lake) 18%, transparent)',
          }}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="min-w-0">{rankText}</span>
        </span>
      ))}
    </div>
  );
}
