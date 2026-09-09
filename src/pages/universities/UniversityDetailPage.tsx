import { ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { BackLink } from '@/shared/ui/BackLink';
import { Card } from '@/shared/ui/Card';
import { LazyMedia } from '@/shared/ui/LazyMedia';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Skeleton } from '@/shared/ui/Skeleton';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { localizeGeo } from '@/shared/i18n/geo';
import { formatCost } from '@/shared/lib/universityDisplay';
import { useBackTo } from '@/shared/lib/useBackTo';
import { useUniversityDetail } from './hooks/useUniversityDetail';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';

export default function UniversityDetailPage() {
  const { t } = useTranslation(['results', 'common']);
  const goBack = useBackTo('/universities');
  const { university, isLoading, error, refetch, toggleFavorite, handleProgramClick } =
    useUniversityDetail();

  return (
    <PageContainer className="space-y-6">
      <BackLink onClick={goBack} className="font-extrabold">
        {t('common:back')}
      </BackLink>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error !== null || !university ? (
        <JourneyEmptyState
          mascotState="pause"
          title={error === 'not_found' ? t('catalog.notFound') : t('catalog.loadFailed')}
          body={error === 'not_found' ? t('catalog.backToList') : t('common:retry')}
          actionLabel={error === 'not_found' ? t('catalog.backToList') : t('common:retry')}
          onAction={error === 'not_found' ? goBack : () => refetch()}
        />
      ) : (
        <>
          {/* Always render a hero band — many seeded rows have no photo, and
              skipping the media block made the detail page feel like a blank
              document under the nav. */}
          <div className="relative w-full h-52 sm:h-72 -mx-4 sm:mx-0 sm:rounded-[20px] overflow-hidden">
            {university.image_url ? (
              <LazyMedia
                src={university.image_url}
                alt={university.name}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-brand-subtle via-default/40 to-accent-soft flex items-center justify-center">
                    <GraduationCap className="w-12 h-12 text-brand/40" aria-hidden="true" />
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-subtle via-default/40 to-accent-soft flex flex-col items-center justify-center gap-2">
                <span className="text-display-lg font-black text-brand/30 leading-none select-none" aria-hidden="true">
                  {(university.short_name || university.name).trim().charAt(0).toUpperCase()}
                </span>
                <GraduationCap className="w-8 h-8 text-brand/40" aria-hidden="true" />
              </div>
            )}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <FavoriteStar
                universityId={university.id}
                isFavorite={university.is_favorite}
                onToggle={toggleFavorite}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-display-md font-black text-primary m-0">{university.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                {localizeGeo(university.city)}, {localizeGeo(university.country)}
              </span>
              <UniversityRankBadges university={university} size="sm" />
            </div>
          </div>

          {university.description && (
            <p className="text-body font-semibold text-secondary leading-relaxed">
              {university.description}
            </p>
          )}

          {university.website && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => window.open(university.website!, '_blank', 'noopener,noreferrer')}
            >
              {t('program.visitSite')}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          <section className="space-y-4 pt-2">
            <h2 className="text-display-sm font-black text-primary m-0">
              {university.programs.length > 0
                ? t('programList.count', { count: university.programs.length })
                : t('catalog.programsHeading')}
            </h2>

            {university.programs.length === 0 ? (
              <p className="text-body text-secondary">{t('catalog.programsEmpty')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                {university.programs.map(program => {
                  const slug = program.profession_slugs[0];
                  const clickable = Boolean(slug);
                  return (
                    <Card
                      key={program.id}
                      onClick={() => clickable && handleProgramClick(program.id, slug)}
                      className={
                        clickable
                          ? '!p-5 flex flex-col gap-3 cursor-pointer transition-[border-color,box-shadow,transform] duration-200 hover:border-brand hover:shadow-pop hover:-translate-y-0.5'
                          : '!p-5 flex flex-col gap-3'
                      }
                    >
                      <h3 className="text-label font-black text-primary m-0">{program.name}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex bg-default/50 text-secondary text-xs font-extrabold px-2.5 py-1 rounded-pill">
                          {program.language}
                        </span>
                      </div>
                      <p className="text-body-sm font-bold text-secondary m-0 flex-1">
                        {program.cost_per_year !== null
                          ? formatCost(Number(program.cost_per_year), t)
                          : (program.cost_label ?? t('results:cost.notSpecified'))}
                      </p>
                      {clickable && (
                        <span className="text-label font-extrabold text-brand mt-1">
                          {t('common:details')}
                        </span>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
