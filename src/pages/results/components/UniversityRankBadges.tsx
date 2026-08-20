import { Trophy } from 'lucide-react';
import { getUniversityRankingLabels } from '@/pages/results/utils/programUtils';
import type { UniversityBrief } from '@/shared/types';

interface UniversityRankBadgesProps {
  university: Pick<UniversityBrief, 'ranking' | 'ranking_label' | 'uniranks_kz_rank' | 'uniranks_world_rank'>;
  size?: 'sm' | 'md';
}

/**
 * One chip per rating scale the university has data for (see
 * getUniversityRankingLabels) — shared between the card grid and the detail
 * page so the rendering (and the font-weight-per-script caveat below) lives
 * in one place instead of two copies drifting apart.
 */
export function UniversityRankBadges({ university, size = 'md' }: UniversityRankBadgesProps) {
  const labels = getUniversityRankingLabels(university);
  if (labels.length === 0) return null;

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2.5 py-0.5'
    : 'text-sm px-3.5 py-1.5';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((rankText, i) => (
        <span
          key={i}
          // font-bold, not font-extrabold — Instrument Sans only ships
          // weights up to 700, and has no Cyrillic glyphs at all, so
          // Cyrillic characters here fall back to the OS font, which
          // *does* have true 800/900 weights. Requesting extrabold (800)
          // makes Latin-only rank text (clamped to 700) look visibly
          // thinner than Cyrillic-containing rank text in the same
          // badge style. bold (700) is Instrument Sans's actual max, so
          // both scripts land close enough to read as the same weight.
          className={`inline-flex items-center gap-1.5 bg-accent-soft text-accent font-bold rounded-pill max-w-full ${sizeClasses}`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="min-w-0">{rankText}</span>
        </span>
      ))}
    </div>
  );
}
