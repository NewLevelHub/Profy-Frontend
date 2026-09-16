import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GraduationCap, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Button, buttonClasses } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { LazyMedia } from '@/shared/ui/LazyMedia';
import type { ProgramBrief } from '@/shared/types';
import type { CountryFilter } from '@/pages/results/hooks/useUniversityList';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { Link } from 'react-router';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';
import { cardImageUrl } from '@/shared/lib/universityDisplay';
import { localizeGeo } from '@/shared/i18n/geo';

const IMAGE_BOX = 'w-full h-32 rounded-2xl mb-4 overflow-hidden relative';

function ImagePlaceholder() {
  return (
    <div className="w-full h-full bg-default/40 flex items-center justify-center">
      <GraduationCap className="w-8 h-8 text-muted" aria-hidden="true" />
    </div>
  );
}

function ProgramCardSkeleton() {
  return (
    <div className="bg-surface border border-default rounded-[var(--radius)] p-6 shadow-card flex flex-col gap-3">
      <div className="flex justify-between gap-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-[52px] w-full rounded-2xl" />
    </div>
  );
}

interface ProgramCardProps {
  program: ProgramBrief;
  /** Адрес программы, а не колбэк: карточка открывается настоящей ссылкой. */
  detailPathFor: (id: string) => string;
  /** Optional: the star is only rendered where starring makes sense (the
   *  signed-in picker), so print/report renders can leave it off. */
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

// Single action now — no separate "select" state. «Подробнее» — настоящая
// ссылка с адресом программы (открыть в новой вкладке, скопировать, дойти
// табом), растянутая на всю карточку через `after:inset-0`; звезда «в
// избранное» поднята по z-оси, чтобы ссылка не перехватывала клик по ней.
//
// `content-visibility:auto` + `contain-intrinsic-size` let the browser skip
// layout/paint *and* image decode for cards that aren't near the viewport.
// The university photos are served at up to 1600px wide; each one decodes to
// ~8 MB of bitmap and is then resampled into a 128px-tall box. Doing that for
// all 50 cards as they scroll into view is what makes the list stutter (an
// empty list with just the icon placeholder stayed smooth). `auto` in the
// intrinsic size means "remember the last real height" so the scrollbar
// doesn't jump as cards virtualize in and out.
const ProgramCard = memo(function ProgramCard({
  program,
  detailPathFor,
  onToggleFavorite,
}: ProgramCardProps) {
  const { t } = useTranslation('results');
  return (
    <Card className="relative !p-6 flex flex-col h-full transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_420px]">
      <div className={IMAGE_BOX}>
        {program.university.image_url ? (
          <LazyMedia
            src={cardImageUrl(program.university.image_url)}
            fallbackSrc={program.university.image_url}
            alt={program.university.name}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
            fallback={<ImagePlaceholder />}
          />
        ) : (
          <ImagePlaceholder />
        )}
        {/* Stars the whole university, not this one program — see PRO-265. */}
        {onToggleFavorite && (
          <FavoriteStar
            universityId={program.university.id}
            isFavorite={program.university.is_favorite}
            onToggle={onToggleFavorite}
            className="absolute top-2 right-2 z-10"
            size="sm"
          />
        )}
      </div>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-display-sm font-black leading-snug text-primary m-0">
          {program.name}
        </h3>
        <span className="shrink-0 bg-brand-subtle text-brand text-xs font-extrabold px-3 py-1 rounded-pill whitespace-nowrap">
          {localizeGeo(program.university.country)}
        </span>
      </div>

      <div className="text-base font-semibold text-muted mb-3 flex flex-col gap-2">
        <span>{program.university.name}</span>
        <UniversityRankBadges university={program.university} size="sm" />
      </div>

      {(() => {
        const useProgramDesc = Boolean(program.description && program.description.length > 40);
        const desc = useProgramDesc
          ? program.description
          : (program.university.description || program.description);
        if (!desc) return null;
        return (
          <div className="mb-4 flex-1">
            <p className="text-body-sm font-semibold text-secondary leading-relaxed m-0">
              {desc.length > 120 ? desc.slice(0, 120) + '...' : desc}
            </p>
          </div>
        );
      })()}

      <Link
        to={detailPathFor(program.id)}
        className={buttonClasses({
          variant: 'ghost',
          className: 'w-full h-[52px] rounded-[var(--radius)] mt-auto after:absolute after:inset-0 after:rounded-[var(--radius)]',
        })}
      >
        {t('common:details')}
      </Link>
    </Card>
  );
});

interface ProgramListSectionProps {
  programs: ProgramBrief[];
  isLoading: boolean;
  error: string | null;
  activeCountry: string | undefined;
  onCountryChange: (country: string | undefined) => void;
  countryFilters: CountryFilter[];
  refetch: () => void;
  detailPathFor: (id: string) => string;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  sortDirection?: 'asc' | 'desc';
  onToggleSort?: () => void;
}

/**
 * Shared program list — country filter row + loading/error/empty states +
 * grid of ProgramCard. Used both by the standalone `/universities` page and
 * inline on `DirectionDetailPage` — one implementation, not duplicated
 * markup. Every card is a single click-through to detail; "Подробнее" only
 * appears as a hover overlay (see ProgramCard).
 */
export function ProgramListSection({
  programs,
  isLoading,
  error,
  activeCountry,
  onCountryChange,
  countryFilters,
  refetch,
  detailPathFor,
  onToggleFavorite,
  sortDirection,
  onToggleSort,
}: ProgramListSectionProps) {
  const { t } = useTranslation('results');
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2.5 flex-wrap" role="group" aria-label={t('programList.countryFilterAria')}>
        {countryFilters.map(filter => (
          <button
            key={filter.label}
            onClick={() => onCountryChange(filter.value)}
            aria-pressed={activeCountry === filter.value}
            className={
              activeCountry === filter.value
                ? 'px-5 py-2 rounded-pill text-sm font-bold bg-brand text-on-brand border-none cursor-pointer'
                : 'px-5 py-2 rounded-pill text-sm font-bold bg-surface text-secondary border-[1.5px] border-strong cursor-pointer hover:border-brand transition-colors'
            }
          >
            {localizeGeo(filter.label)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <>
          <div className="text-sm font-bold text-muted">{t('programList.loading')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {Array.from({ length: 6 }, (_, i) => <ProgramCardSkeleton key={i} />)}
          </div>
        </>
      ) : error !== null ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-danger">{error}</p>
          <Button variant="ghost" onClick={() => refetch()}>{t('common:retry')}</Button>
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <GraduationCap className="w-12 h-12 text-muted" aria-hidden="true" />
          <p className="text-label font-bold text-primary">{t('programList.emptyTitle')}</p>
          <p className="text-body text-secondary">{t('programList.emptyBody')}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-sm font-bold text-muted">
            <span>{t('programList.count', { count: programs.length })}</span>
            {onToggleSort && sortDirection && (
              <button
                onClick={onToggleSort}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-default/40 hover:bg-default/70 text-secondary text-xs font-extrabold border-none cursor-pointer transition-colors"
              >
                {t('programList.sortPrefix', {
                  order: sortDirection === 'asc' ? t('programList.sortByRatingDesc') : t('programList.sortByRatingAsc'),
                })}
                {sortDirection === 'asc'
                  ? <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                  : <ArrowUpWideNarrow className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                detailPathFor={detailPathFor}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
