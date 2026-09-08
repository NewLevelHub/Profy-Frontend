import { memo } from 'react';
import { Link } from 'react-router';
import { GraduationCap, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buttonClasses } from '@/shared/ui/Button';
import { LazyMedia } from '@/shared/ui/LazyMedia';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { localizeGeo } from '@/shared/i18n/geo';
import { cardImageUrl } from '@/shared/lib/universityDisplay';
import type { UniversityListItem } from '@/shared/types';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';
import { cn } from '@/shared/lib/cn';

const IMAGE_BOX = 'w-full h-36 rounded-[14px] mb-4 overflow-hidden relative';

function ImagePlaceholder({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{
        background:
          'radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--sky) 45%, transparent), transparent 55%), color-mix(in srgb, var(--pine) 8%, var(--bg-raised))',
      }}
    >
      <span
        className="text-display-md font-semibold leading-none select-none"
        style={{ color: 'color-mix(in srgb, var(--pine) 40%, transparent)' }}
        aria-hidden="true"
      >
        {initial}
      </span>
      <GraduationCap className="w-5 h-5" style={{ color: 'color-mix(in srgb, var(--pine) 45%, transparent)' }} aria-hidden="true" />
    </div>
  );
}

interface UniversityCardProps {
  university: UniversityListItem;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

/**
 * Mirrors the ProgramCard in the results-side picker on purpose — same photo
 * box, same country pill, same rank chip — so a university reads the same
 * wherever it appears. Glass shell matches the rest of the mesh UI.
 *
 * Открывается настоящей ссылкой: «Подробнее» растянута на всю карточку
 * через `after:inset-0`, звезда избранного поднята по z-оси.
 */
export const UniversityCard = memo(function UniversityCard({
  university,
  onToggleFavorite,
}: UniversityCardProps) {
  const { t } = useTranslation(['results', 'common']);

  return (
    <article
      className={cn(
        'panel-glass relative !p-5 sm:!p-6 flex flex-col h-full',
        'transition-[border-color,box-shadow,transform] duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_22px_44px_color-mix(in_srgb,var(--midnight)_8%,transparent)]',
        '[content-visibility:auto] [contain-intrinsic-size:auto_420px]',
      )}
    >
      <div className={cn(IMAGE_BOX, 'uni-card-media')}>
        {university.image_url ? (
          <LazyMedia
            src={cardImageUrl(university.image_url)}
            fallbackSrc={university.image_url}
            alt={university.name}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover uni-card-media__img"
            fallback={<ImagePlaceholder name={university.name} />}
          />
        ) : (
          <ImagePlaceholder name={university.name} />
        )}
        <FavoriteStar
          universityId={university.id}
          isFavorite={university.is_favorite}
          onToggle={onToggleFavorite}
          className="absolute top-2.5 right-2.5 z-10"
        />
        <span
          className="absolute bottom-2.5 left-2.5 text-caption font-semibold px-2.5 py-1 rounded-pill"
          style={{
            color: 'var(--pine)',
            background: 'color-mix(in srgb, var(--paper) 90%, transparent)',
            border: '1px solid color-mix(in srgb, #fff 55%, var(--border))',
            backdropFilter: 'blur(8px)',
          }}
        >
          {localizeGeo(university.country)}
        </span>
      </div>

      <h3 className="text-display-sm font-semibold leading-snug text-[color:var(--text-heading)] m-0 mb-2">
        {university.name}
      </h3>

      <div className="text-body-sm font-book text-muted mb-3 flex flex-col gap-2.5">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {localizeGeo(university.city)}
        </span>
        <UniversityRankBadges university={university} size="sm" />
      </div>

      {university.description && (
        <p className="text-body-sm font-book text-secondary leading-relaxed mb-4 flex-1">
          {university.description.length > 110
            ? `${university.description.slice(0, 110)}...`
            : university.description}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <span className="text-caption font-semibold text-muted">
          {t('programList.count', { count: university.programs_count })}
        </span>
        <Link
          to={`/universities/${university.id}`}
          className={buttonClasses({
            variant: 'ghost',
            className:
              'w-full h-[48px] rounded-[14px] after:absolute after:inset-0 after:rounded-[20px]',
          })}
        >
          {t('common:details')}
        </Link>
      </div>
    </article>
  );
});
