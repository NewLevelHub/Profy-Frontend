import { memo } from 'react';
import { GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { LazyMedia } from '@/shared/ui/LazyMedia';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { cardImageUrl } from '@/shared/lib/universityDisplay';
import { pluralize } from '@/shared/lib/plural';
import type { UniversityListItem } from '@/shared/types';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';

const IMAGE_BOX = 'w-full h-36 rounded-2xl mb-4 overflow-hidden relative';

function ImagePlaceholder({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="w-full h-full bg-gradient-to-br from-brand-subtle via-default/30 to-accent-soft flex flex-col items-center justify-center gap-2">
      <span className="text-display-md font-black text-brand/35 leading-none select-none" aria-hidden="true">
        {initial}
      </span>
      <GraduationCap className="w-6 h-6 text-brand/40" aria-hidden="true" />
    </div>
  );
}

interface UniversityCardProps {
  university: UniversityListItem;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

/**
 * Mirrors the ProgramCard in the results-side picker on purpose — same photo
 * box, same country pill, same rank chip — so a university reads the same
 * wherever it appears. `content-visibility:auto` for the same reason it is on
 * ProgramCard: the photos are served at up to 1600px and decoding a page of
 * them at once is what makes the grid stutter.
 */
export const UniversityCard = memo(function UniversityCard({
  university,
  onOpen,
  onToggleFavorite,
}: UniversityCardProps) {
  return (
    <Card
      onClick={() => onOpen(university.id)}
      className="!p-5 sm:!p-6 flex flex-col h-full cursor-pointer transition-[border-color,box-shadow,transform] duration-200 hover:border-brand hover:shadow-pop hover:-translate-y-0.5 [content-visibility:auto] [contain-intrinsic-size:auto_420px]"
    >
      <div className={IMAGE_BOX}>
        {university.image_url ? (
          <LazyMedia
            src={cardImageUrl(university.image_url)}
            fallbackSrc={university.image_url}
            alt={university.name}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
            fallback={<ImagePlaceholder name={university.name} />}
          />
        ) : (
          <ImagePlaceholder name={university.name} />
        )}
        <FavoriteStar
          universityId={university.id}
          isFavorite={university.is_favorite}
          onToggle={onToggleFavorite}
          className="absolute top-2 right-2"
        />
        <span className="absolute bottom-2 left-2 bg-surface/95 backdrop-blur-sm text-brand text-xs font-extrabold px-2.5 py-1 rounded-pill shadow-card">
          {university.country}
        </span>
      </div>

      {/* Full name, not short_name: abbreviations are not unique in this
          data (three different rows share "NUS"), so a grid of short names
          reads as duplicate cards. */}
      <h3 className="text-display-sm font-black leading-snug text-primary m-0 mb-2">
        {university.name}
      </h3>

      <div className="text-base font-semibold text-muted mb-3 flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
          {university.city}
        </span>
        <UniversityRankBadges university={university} size="sm" />
      </div>

      {university.description && (
        <p className="text-body-sm font-semibold text-secondary leading-relaxed mb-4 flex-1">
          {university.description.length > 110
            ? `${university.description.slice(0, 110)}...`
            : university.description}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <span className="text-sm font-bold text-muted">
          {pluralize(university.programs_count, 'программа', 'программы', 'программ')}
        </span>
        <Button
          variant="ghost"
          className="w-full h-[48px] rounded-[var(--radius)] cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            onOpen(university.id);
          }}
        >
          Подробнее
        </Button>
      </div>
    </Card>
  );
});
