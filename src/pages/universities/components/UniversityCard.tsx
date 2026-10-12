import { memo } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UniversityRankBadges } from '@/shared/ui/UniversityRankBadges';
import { UniversityMedia } from '@/shared/ui/redesign/UniversityMedia';
import { localizeGeo } from '@/shared/i18n/geo';
import type { UniversityListItem } from '@/shared/types';
import { FavoriteStar } from '@/shared/ui/FavoriteStar';

interface UniversityCardProps {
  university: UniversityListItem;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

/** The stretched link and the favourite button remain independent actions. */
export const UniversityCard = memo(function UniversityCard({ university, onToggleFavorite }: UniversityCardProps) {
  const { t } = useTranslation(['results', 'common']);
  return <article className="rd-university-card">
    <div className="rd-university-cover">
      <UniversityMedia name={university.name} shortName={university.short_name} src={university.image_url} />
      <FavoriteStar universityId={university.id} isFavorite={university.is_favorite} onToggle={onToggleFavorite} className="rd-university-favorite" />
      <span className="rd-university-country">{localizeGeo(university.country)}</span>
    </div>
    <div className="rd-university-card-body">
      <p className="rd-university-location"><MapPin size={14} aria-hidden="true" />{localizeGeo(university.city)}</p>
      <h3>{university.name}</h3>
      <UniversityRankBadges university={university} size="sm" />
      {university.description && <p className="rd-university-description">{university.description}</p>}
      <div className="rd-university-card-footer">
        <span>{t('programList.count', { count: university.programs_count })}</span>
        <Link to={`/universities/${university.id}`} className="rd-card-link" aria-label={t('catalogDesign.openUniversity', { name: university.name })}>{t('common:details')}<ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>;
});
