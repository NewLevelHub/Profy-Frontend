import { useTranslation } from 'react-i18next';
import type { ProfileResponse } from '@/shared/types';
import { LedgerSection } from '../components/LedgerSection';
import { ChipList } from '../components/ChipList';

export interface SubjectsSectionProps {
  profile: ProfileResponse;
  onEdit: () => void;
}

export function SubjectsSection({ profile, onEdit }: SubjectsSectionProps) {
  const { t } = useTranslation('profile');
  return (
    <LedgerSection
      id="subjects"
      number="02"
      title={t('subjects.title')}
      editLabel={t('common.edit')}
      editAriaLabel={t('subjects.editAria')}
      onEdit={onEdit}
    >
      <div className="flex flex-col gap-4">
        <ChipList label={t('subjects.liked')} items={profile.subjects_liked} variant="solid" />
        <ChipList label={t('subjects.easy')} items={profile.subjects_easy} variant="outline" />
        <ChipList label={t('subjects.disliked')} items={profile.subjects_disliked} variant="muted" />
        <ChipList label={t('subjects.hard')} items={profile.subjects_hard} variant="muted" />
      </div>
    </LedgerSection>
  );
}
