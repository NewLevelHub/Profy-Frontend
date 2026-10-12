import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownWideNarrow, ArrowUpWideNarrow, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { Skeleton } from '@/shared/ui/Skeleton';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { UniversityMedia } from '@/shared/ui/redesign/UniversityMedia';
import type { ProgramBrief } from '@/shared/types';
import type { CountryFilter } from '@/pages/results/hooks/useUniversityList';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';
import { localizeGeo } from '@/shared/i18n/geo';

function ProgramCardSkeleton() {
  return <div className="rd-university-card rd-university-skeleton">
    <Skeleton className="h-36 w-full rounded-xl" /><Skeleton className="h-6 w-2/3" />
    <Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-full" />
  </div>;
}

interface ProgramCardProps {
  program: ProgramBrief;
  detailPathFor: (id: string) => string;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

const ProgramCard = memo(function ProgramCard({ program, detailPathFor, onToggleFavorite }: ProgramCardProps) {
  const { t } = useTranslation('results');
  const desc = program.description && program.description.length > 40
    ? program.description : (program.university.description || program.description);
  return <article className="rd-university-card rd-program-card">
    <div className="rd-university-cover">
      <UniversityMedia name={program.university.name} shortName={program.university.short_name} src={program.university.image_url} />
      {onToggleFavorite && <FavoriteStar universityId={program.university.id} isFavorite={program.university.is_favorite} onToggle={onToggleFavorite} className="rd-university-favorite" />}
      <span className="rd-university-country">{localizeGeo(program.university.country)}</span>
    </div>
    <div className="rd-university-card-body">
      <p className="rd-program-university">{program.university.name}</p>
      <h3>{program.name}</h3>
      <p className="rd-university-location"><MapPin size={14} aria-hidden="true" />{localizeGeo(program.university.city)}</p>
      <UniversityRankBadges university={program.university} size="sm" />
      {desc && <p className="rd-university-description">{desc}</p>}
      <div className="rd-university-card-footer"><span>{program.language}</span>
        <Link to={detailPathFor(program.id)} className="rd-card-link" aria-label={t('catalogDesign.openProgram', { name: program.name })}>{t('common:details')}<ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>;
});

export interface ProgramListSectionProps {
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

/** Shared by the direction page and the standalone list. Data and sorting stay in the page hook. */
export function ProgramListSection({ programs, isLoading, error, activeCountry, onCountryChange,
  countryFilters, refetch, detailPathFor, onToggleFavorite, sortDirection, onToggleSort }: ProgramListSectionProps) {
  const { t } = useTranslation('results');
  return <div className="rd-program-list" aria-busy={isLoading}>
    <div className="rd-program-countries" role="group" aria-label={t('programList.countryFilterAria')}>
      {countryFilters.map(filter => <button type="button" key={filter.label} onClick={() => onCountryChange(filter.value)} aria-pressed={activeCountry === filter.value}>{localizeGeo(filter.label)}</button>)}
    </div>
    {isLoading ? <>
      <p className="rd-catalog-count" role="status">{t('programList.loading')}</p>
      <div className="rd-university-grid">{Array.from({ length: 6 }, (_, i) => <ProgramCardSkeleton key={i} />)}</div>
    </> : error !== null ? <JourneyEmptyState illustration="/mascot/redesign/rest.png" title={t('error.somethingWrong')} body={error} actionLabel={t('common:retry')} onAction={refetch} />
      : programs.length === 0 ? <JourneyEmptyState illustration="/mascot/redesign/book.png" title={t('programList.emptyTitle')} body={t('programList.emptyBody')} />
        : <>
          <div className="rd-catalog-count"><span>{t('programList.count', { count: programs.length })}</span>
            {onToggleSort && sortDirection && <button type="button" onClick={onToggleSort} className="rd-sort-button">
              {t('programList.sortPrefix', { order: sortDirection === 'asc' ? t('programList.sortByRatingDesc') : t('programList.sortByRatingAsc') })}
              {sortDirection === 'asc' ? <ArrowDownWideNarrow size={16} aria-hidden="true" /> : <ArrowUpWideNarrow size={16} aria-hidden="true" />}
            </button>}
          </div>
          <div className="rd-university-grid">{programs.map(program => <ProgramCard key={program.id} program={program} detailPathFor={detailPathFor} onToggleFavorite={onToggleFavorite} />)}</div>
        </>}
  </div>;
}
