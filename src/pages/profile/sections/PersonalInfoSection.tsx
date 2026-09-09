import { useTranslation } from 'react-i18next';
import type { ProfileResponse } from '@/shared/types';
import { localizeGeo } from '@/shared/i18n/geo';
import { LedgerSection } from '../components/LedgerSection';
import { RuledGrid, RuledCell } from '../components/RuledGrid';

export interface PersonalInfoSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function PersonalInfoSection({ profile, onEdit }: PersonalInfoSectionProps) {
  const { t } = useTranslation('profile');
  return (
    <LedgerSection
      id="personal"
      number="01"
      title={t('personal.title')}
      editLabel={t('common.edit')}
      editAriaLabel={t('personal.editAria')}
      onEdit={onEdit}
    >
      <RuledGrid className="grid grid-cols-2 sm:grid-cols-4">
        <RuledCell label={t('personal.age')} value={t('common:ageYears', { count: profile.age })} />
        <RuledCell label={t('personal.grade')} value={t('personal.gradeValue', { count: profile.grade })} />
        <RuledCell label={t('personal.city')} value={localizeGeo(profile.city)} />
        <RuledCell label={t('personal.country')} value={localizeGeo(profile.country)} />
      </RuledGrid>
    </LedgerSection>
  );
}
