import { ArrowUpRight, ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BackLink } from '@/shared/ui/BackLink';
import { PageContainer } from '@/shared/ui/PageContainer';
import { Skeleton } from '@/shared/ui/Skeleton';
import { JourneyEmptyState } from '@/shared/ui/JourneyEmptyState';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { UniversityMedia } from '@/shared/ui/redesign/UniversityMedia';
import { localizeGeo } from '@/shared/i18n/geo';
import { formatCost } from '@/shared/lib/universityDisplay';
import { useBackTo } from '@/shared/lib/useBackTo';
import { useUniversityDetail } from './hooks/useUniversityDetail';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';

export default function UniversityDetailPage() {
  const goBack = useBackTo('/universities');
  return <UniversityDetailView model={useUniversityDetail()} goBack={goBack} />;
}

export function UniversityDetailView({ model, goBack }: {
  model: Pick<ReturnType<typeof useUniversityDetail>, 'university' | 'isLoading' | 'error' | 'toggleFavorite'> & { refetch: () => void }; goBack: () => void;
}) {
  const { t } = useTranslation(['results', 'common']);
  const { university, isLoading, error, refetch, toggleFavorite } = model;
  return <PageContainer className="rd-catalog rd-detail">
    <BackLink onClick={goBack} className="rd-detail-back">{t('common:back')}</BackLink>
    {isLoading ? <div className="space-y-4"><Skeleton className="h-72 w-full rounded-2xl" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-28 w-full" /></div>
      : error !== null || !university ? <JourneyEmptyState illustration="/mascot/redesign/rest.png"
        title={error === 'not_found' ? t('catalog.notFound') : t('catalog.loadFailed')}
        body={error === 'not_found' ? t('catalog.backToList') : t('common:retry')}
        actionLabel={error === 'not_found' ? t('catalog.backToList') : t('common:retry')}
        onAction={error === 'not_found' ? goBack : () => refetch()} />
      : <>
        <section className="rd-university-hero">
          <div className="rd-university-hero-media">
            <UniversityMedia name={university.name} shortName={university.short_name} src={university.image_url} fullSize />
            <FavoriteStar universityId={university.id} isFavorite={university.is_favorite} onToggle={toggleFavorite} className="rd-university-favorite" />
          </div>
          <div className="rd-university-hero-content">
            <h1>{university.name}</h1>
            <p className="rd-university-location"><MapPin size={16} aria-hidden="true" />{localizeGeo(university.city)}, {localizeGeo(university.country)}</p>
            <UniversityRankBadges university={university} size="sm" />
            {university.website && <a href={university.website} target="_blank" rel="noopener noreferrer" className="rd-text-link">{t('program.visitSite')}<ExternalLink size={15} aria-hidden="true" /></a>}
          </div>
        </section>
        {university.description && <section className="rd-university-about">
          <h2>{t('catalogDesign.aboutUniversity')}</h2><p>{university.description}</p>
        </section>}
        <section className="rd-university-programs">
          <div className="rd-section-heading"><h2>{t('catalog.programsHeading')}</h2>
            {university.programs.length > 0 && <span>{t('programList.count', { count: university.programs.length })}</span>}
          </div>
          {university.programs.length === 0 ? <p className="rd-catalog-empty-copy">{t('catalog.programsEmpty')}</p>
            : <div className="rd-university-course-grid">{university.programs.map(program => {
              const slug = program.profession_slugs[0];
              return <article key={program.id} className="rd-university-course">
                <h3>{program.name}</h3>
                <dl><div><dt>{t('catalogDesign.language')}</dt><dd>{program.language}</dd></div>
                  <div><dt>{t('catalogDesign.cost')}</dt><dd>{program.cost_per_year !== null ? formatCost(Number(program.cost_per_year), t) : (program.cost_label ?? t('cost.notSpecified'))}</dd></div></dl>
                {slug && <Link to={`/results/directions/${encodeURIComponent(slug)}/universities/${program.id}`} className="rd-card-link" aria-label={t('catalogDesign.openProgram', { name: program.name })}>{t('common:details')}<ArrowUpRight size={17} aria-hidden="true" /></Link>}
              </article>;
            })}</div>}
        </section>
      </>}
  </PageContainer>;
}
